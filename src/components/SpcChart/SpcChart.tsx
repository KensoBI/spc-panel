/* eslint-disable deprecation/deprecation */
import {
  DataFrame,
  DataFrameView,
  dateTime,
  Field,
  FieldColorModeId,
  FieldType,
  getDisplayProcessor,
  ThresholdsConfig,
  ThresholdsMode,
  TimeRange,
  toDataFrame,
  toFixed,
} from '@grafana/data';
import {
  Alert,
  GraphFieldConfig,
  GraphGradientMode,
  GraphThresholdsStyleConfig,
  GraphTresholdsStyleMode,
  LegendDisplayMode,
  LineInterpolation,
  PanelContextProvider,
  TimeSeries,
  TooltipDisplayMode,
  TooltipPlugin,
  usePanelContext,
  useTheme2,
} from '@grafana/ui';
import React from 'react';
import { FlagEntity, FlagsPlugin, isFlagEntityArray } from './FlagsPlugin';
import { AxisPropsReflection } from './AxisPropsReflection';
import { cloneDeep } from 'lodash';
import { usePanelProps } from '../PanelPropsProvider';
import { AnnotationsDataFrameViewDTO } from './types';

const TIMESERIES_SAMPLE_LABEL = 'Sample';

const flagsKeyFromDatasource = 'annotations';

type Props = {
  dataFrameName: string;
  timeField?: Field<string, number[]>;
  valueField?: Field<string, number[]>;
  limits?: {
    up?: {
      value: number;
      color: string;
    };
    down?: {
      value: number;
      color: string;
    };
  };
  constants?: Array<{
    value: number;
    color: string;
    title: string;
    lineWidth: number;
  }>;
  lineWidth: number;
  pointSize: number;
  fill: number;
  width: number;
  height: number;
  lineColor: string;
  showLegend: boolean;
  decimals: number;
  onSeriesColorChange: (label: string, color: string) => void;
  annotations?: DataFrame[];
};

export function SpcChart(props: Props) {
  const {
    timeField,
    valueField,
    limits,
    constants,
    dataFrameName,
    lineWidth,
    pointSize,
    fill,
    width,
    height,
    lineColor,
    showLegend,
    decimals,
    onSeriesColorChange,
    annotations,
  } = props;
  const { timeZone, timeRange } = usePanelProps();
  const theme = useTheme2();

  const dataFrames = React.useMemo(() => {
    if (timeField == null || valueField == null) {
      return undefined;
    }

    const valField = cloneDeep(valueField);
    const fields = [cloneDeep(timeField)];

    const addConstantField = (value: number, name: string, color: string, lineWidth: number) => {
      fields.push({
        name: name,
        values: valField.values.map(() => value),
        config: {
          color: {
            mode: FieldColorModeId.Fixed,
            fixedColor: color,
          },
          custom: {
            lineWidth: lineWidth,
          },
        },

        type: FieldType.number,
      });
    };

    if (constants) {
      for (const c of constants) {
        if (!isNaN(c.value)) {
          addConstantField(c.value, c.title, c.color, c.lineWidth);
        }
      }
    }

    const thresholds: ThresholdsConfig = {
      mode: ThresholdsMode.Absolute,
      steps: [],
    };

    if (limits != null) {
      if (limits.down != null && limits.up == null) {
        thresholds.steps = [
          {
            color: limits.down.color,
            value: -Infinity,
          },
          {
            color: 'transparent',
            value: limits.down.value,
          },
        ];
      } else if (limits.down == null && limits.up != null) {
        thresholds.steps = [
          {
            color: 'transparent',
            value: -Infinity,
          },
          {
            color: limits.up.color,
            value: limits.up.value,
          },
        ];
      } else if (limits.down != null && limits.up != null && limits.down.value < limits.up.value) {
        thresholds.steps = [
          {
            color: limits.down.color,
            value: -Infinity,
          },
          {
            color: 'transparent',
            value: limits.down.value,
          },
          {
            color: limits.up.color,
            value: limits.up.value,
          },
        ];
      }
    }

    const hasTresholds = thresholds.steps.length > 0;

    const thresholdsStyle: GraphThresholdsStyleConfig = {
      mode: GraphTresholdsStyleMode.Area,
    };

    const custom: GraphFieldConfig = {
      ...(valField.config?.custom ?? {}),
      gradientMode: GraphGradientMode.Opacity,
      lineWidth: lineWidth,
      lineInterpolation: LineInterpolation.Smooth,
      thresholdsStyle,
      pointSize: pointSize,
      fillOpacity: fill * 10,
    };

    valField.config = {
      thresholds: hasTresholds ? thresholds : undefined,
      custom,
      displayName: valField.labels?.control ? valField.labels?.control + ' sample' : TIMESERIES_SAMPLE_LABEL,
      color: {
        mode: FieldColorModeId.Fixed,
        fixedColor: lineColor,
        seriesBy: 'min',
      },
    };

    valField.name = TIMESERIES_SAMPLE_LABEL;

    fields.push(valField); //on-top rendering (after constants)

    for (const f of fields) {
      if (f) {
        f.display = getDisplayProcessor({
          field: f,
          theme: theme,
        });
        f.config.decimals = decimals;
      }
    }

    const df = toDataFrame({
      name: dataFrameName,
      fields,
    });

    return [df];
  }, [constants, dataFrameName, decimals, fill, limits, lineColor, lineWidth, pointSize, theme, timeField, valueField]);

  const tweakAxis = React.useCallback(
    (opts: AxisPropsReflection, forField: Field) => {
      opts.formatValue = (value) => {
        return value == null ? '' : typeof value === 'number' ? toFixed(value, decimals) : `${value}`;
      };
      return opts;
    },
    [decimals]
  );

  const timeRangeFromData: TimeRange = React.useMemo(() => {
    const start = timeField?.values[0];
    const stop = timeField?.values[timeField?.values.length - 1];
    if (start == null || stop == null || start === stop) {
      return timeRange;
    }

    const raw = {
      from: dateTime(start),
      to: dateTime(stop),
    };
    return {
      from: raw.from,
      to: raw.to,
      raw: raw,
    };
  }, [timeField?.values, timeRange]);

  const flags = React.useMemo(() => {
    const flagsArray = valueField?.config?.custom?.[flagsKeyFromDatasource];
    let entities = isFlagEntityArray(flagsArray) ? flagsArray : undefined;

    const addFlag = (entity: FlagEntity) => {
      if (entities == null) {
        entities = [];
      }
      entities.push(entity);
    };

    if (annotations != null) {
      const views: Array<DataFrameView<AnnotationsDataFrameViewDTO>> = [];

      for (const frame of annotations) {
        views.push(new DataFrameView(frame));
      }

      for (let i = 0; i < views.length; i++) {
        const annotationsView = views[i];
        for (let j = 0; j < annotationsView.length; j++) {
          const annotation = annotationsView.get(j);

          if (!annotation.time) {
            continue;
          }

          addFlag({
            type: 'flag',
            time: annotation.time,
            title: annotation.text,
            color: annotation.color,
          });
        }
      }
    }

    return entities;
  }, [annotations, valueField?.config?.custom]);

  if (!dataFrames) {
    return <Alert title="No Data" severity="warning" />;
  }

  return (
    <Wrapper onSeriesColorChange={onSeriesColorChange}>
      <TimeSeries
        width={width}
        height={height}
        frames={dataFrames}
        timeZone={timeZone}
        timeRange={timeRangeFromData}
        tweakAxis={tweakAxis}
        options={{}}
        legend={{
          showLegend: showLegend,
          calcs: [],
          displayMode: showLegend ? LegendDisplayMode.List : LegendDisplayMode.Hidden,
          placement: 'bottom',
        }}
      >
        {(config, alignedDataFrame) => {
          return (
            <>
              <TooltipPlugin
                frames={dataFrames}
                data={alignedDataFrame}
                config={config}
                mode={TooltipDisplayMode.Multi}
                timeZone={timeZone}
              />

              {flags && <FlagsPlugin flags={flags} config={config} />}
            </>
          );
        }}
      </TimeSeries>
    </Wrapper>
  );
}

function Wrapper({
  children,
  onSeriesColorChange,
}: React.PropsWithChildren<{ onSeriesColorChange: Props['onSeriesColorChange'] }>) {
  const originalContext = usePanelContext();

  const customContext = React.useMemo(
    () => ({
      ...originalContext,
      onSeriesColorChange,
    }),
    [onSeriesColorChange, originalContext]
  );

  return <PanelContextProvider value={customContext}>{children}</PanelContextProvider>;
}
