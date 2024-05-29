import { css } from '@emotion/css';
import { StandardEditorProps, GrafanaTheme2 } from '@grafana/data';
import { useStyles2, InlineField, Select } from '@grafana/ui';
import React from 'react';
import { SpcOptions, PanelOptions, PresetChartType, defaultConstantColor, ConstantConfigItem } from 'types';
import { useParseSpcOptions } from './parseOptions';
import { SpcParam, allSpcParamsDict } from 'data/spcParams';

type Props = StandardEditorProps<SpcOptions, any, PanelOptions>;
export function ChartPresets(props: Props) {
  const styles = useStyles2(getStyles);

  const { value: options, isVar } = useParseSpcOptions(props.value);
  const onChange = props.onChange;

  const defaultLineWidth = 2;
  const defaultControlLimitColor = 'red';
  const defaultMeanColor = 'blue';

  const setSpcParam = (
    name: SpcParam,
    color: string = defaultConstantColor,
    lineWidth: number = defaultLineWidth
  ): ConstantConfigItem => ({
    name,
    color,
    title: allSpcParamsDict[name],
    lineWidth,
  });

  const presetChartOptions: Array<{ label: string; value: PresetChartType }> = [
    { label: 'X-bar for R chart', value: 'xbarRChart' },
    { label: 'R chart', value: 'RChart' },
    { label: 'X-bar for S chart', value: 'xbarSChart' },
    { label: 'S chart', value: 'SChart' },
    { label: 'XmR chart', value: 'xmr' },
  ];

  const presetChartOptionsMap: Record<PresetChartType, SpcOptions> = {
    xbarRChart: {
      sampleSize: 5,
      aggregation: 'mean',
      constantsConfig: {
        items: [
          setSpcParam('ucl_Rbar', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('lcl_Rbar', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('mean', defaultMeanColor, defaultLineWidth),
        ],
      },
    },
    RChart: {
      sampleSize: 5,
      aggregation: 'range',
      constantsConfig: {
        items: [
          setSpcParam('ucl', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('lcl', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('mean', defaultMeanColor, defaultLineWidth),
        ],
      },
    },
    xbarSChart: {
      sampleSize: 5,
      aggregation: 'mean',
      constantsConfig: {
        items: [
          setSpcParam('ucl_Sbar', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('lcl_Sbar', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('mean', defaultMeanColor, defaultLineWidth),
        ],
      },
    },
    SChart: {
      sampleSize: 5,
      aggregation: 'standardDeviation',
      constantsConfig: {
        items: [
          setSpcParam('ucl', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('lcl', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('mean', defaultMeanColor, defaultLineWidth),
        ],
      },
    },
    xmr: {
      sampleSize: 1,
      aggregation: 'mean',
      chartType: 'timeseries',
      constantsConfig: {
        items: [
          setSpcParam('ucl_x', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('lcl_x', defaultControlLimitColor, defaultLineWidth),
          setSpcParam('mean', defaultMeanColor, defaultLineWidth),
        ],
      },
    },
  };

  return (
    <>
      <div className={styles.row}>
        <InlineField label="Chart preset" disabled={false}>
          <Select
            disabled={isVar}
            options={presetChartOptions}
            onChange={(e) => {
              const selectedPreset = presetChartOptionsMap[e.value as PresetChartType];
              if (selectedPreset) {
                const { sampleSize, aggregation, constantsConfig } = selectedPreset;
                onChange({ ...options, sampleSize, aggregation, constantsConfig });
              }
            }}
            width={'auto'}
          />
        </InlineField>
      </div>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background-color: ${theme.colors.background.canvas};
      padding: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius(2)};
    `,
    row: css`
      display: flex;
      gap: ${theme.spacing(0)};
      flex-wrap: wrap;
    `,
  };
};
