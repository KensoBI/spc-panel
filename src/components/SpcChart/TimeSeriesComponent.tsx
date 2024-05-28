import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import React from 'react';
import { SpcChart } from './SpcChart';
import { defaultTimeseriesSettings, TimeseriesSettings } from './types';
import { defaults } from 'lodash';
import { Characteristic, Feature } from 'data/types';
import { css } from '@emotion/css';

const TIMESERIES_SAMPLE_LABEL = 'Sample';

type Props = {
  feature: Feature;
  characteristic: Characteristic;
  settings?: TimeseriesSettings;
};

export function TimeSeriesComponent({ characteristic, settings }: Props) {
  const styles = useStyles2(getStyles);

  const settingsWithDefaults = React.useMemo(() => defaults(settings, defaultTimeseriesSettings), [settings]);

  const controlName = settingsWithDefaults.controlName;
  const constantsConfig = settingsWithDefaults.constantsConfig;
  const limitConfig = settingsWithDefaults.limitConfig;
  const lineWidth = settingsWithDefaults.lineWidth!;
  const pointSize = settingsWithDefaults.pointSize!;
  const fill = settingsWithDefaults.fill!;
  const lineColor = settingsWithDefaults.lineColor as string;
  const showLegend = settingsWithDefaults.showLegend;
  const decimals = settingsWithDefaults.decimals;
  const drawStyle = settingsWithDefaults.drawStyle;
  const max = settingsWithDefaults.max;
  const min = settingsWithDefaults.min;
  const displayName = settingsWithDefaults.displayName;

  const limits = React.useMemo(
    () => ({
      up:
        limitConfig?.up != null
          ? { value: characteristic?.table?.[limitConfig.up.name], color: limitConfig.up.color }
          : undefined,
      down:
        limitConfig?.down != null
          ? { value: characteristic?.table?.[limitConfig.down.name], color: limitConfig.down.color }
          : undefined,
    }),
    [characteristic?.table, limitConfig]
  );

  const constants = React.useMemo(() => {
    return constantsConfig?.items
      ?.map((config) => ({
        title: config.title,
        value: characteristic?.table?.[config.name],
        color: config.color,
        lineWidth: config.lineWidth,
      }))
      ?.filter((c) => c.value != null);
  }, [characteristic?.table, constantsConfig]);

  const [containerRef, setContainerRef] = React.useState<HTMLElement | null>(null);

  const [height, setHeight] = React.useState<number | undefined>();
  const [width, setWidth] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (containerRef == null) {
      return;
    }

    const ro = new ResizeObserver((entry) => {
      const rect = entry?.[0]?.contentRect;
      if (rect) {
        setWidth(rect.width);
        setHeight(rect.height);
      }
    });
    ro.observe(containerRef);

    return () => {
      ro.disconnect();
    };
  }, [containerRef]);

  const setSettings = React.useCallback((newSettings: TimeseriesSettings) => {
    //TODO: Implement
    // console.log('setSettings', newSettings);
  }, []);

  const onSeriesColorChange = React.useCallback(
    (label: string, color: string) => {
      if (label === TIMESERIES_SAMPLE_LABEL) {
        setSettings({ ...settingsWithDefaults, lineColor: color });
      }
      if (settingsWithDefaults.constantsConfig != null) {
        for (const constant of settingsWithDefaults.constantsConfig.items) {
          if (constant.name === label) {
            constant.color = color;
            setSettings({ ...settingsWithDefaults });
            break;
          }
        }
      }
    },
    [setSettings, settingsWithDefaults]
  );

  return (
    <div ref={setContainerRef} className={`timeseries-container ${styles.container}`}>
      {width && height ? (
        <SpcChart
          dataFrameName={controlName}
          timeField={characteristic?.timeseries?.time}
          valueField={characteristic?.timeseries?.values}
          limits={limits}
          constants={constants}
          lineWidth={lineWidth}
          pointSize={pointSize}
          fill={fill}
          width={width}
          height={height}
          lineColor={lineColor}
          showLegend={!!showLegend}
          decimals={decimals ?? 3}
          max={max}
          min={min}
          displayName={displayName}
          onSeriesColorChange={onSeriesColorChange}
          drawStyle={drawStyle ?? 'line'}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      padding: 10px;
      height: 100%;
    `,
  };
};
