import { css } from '@emotion/css';
import { StandardEditorProps, GrafanaTheme2 } from '@grafana/data';
import { useStyles2, InlineField, Select } from '@grafana/ui';
import React from 'react';
import { SpcOptions, PanelOptions, PresetChartType } from 'types';
import { useParseSpcOptions } from './parseOptions';
import { allSpcParamsDict } from 'data/spcParams';

type Props = StandardEditorProps<SpcOptions, any, PanelOptions>;
export function ChartPresets(props: Props) {
  const styles = useStyles2(getStyles);

  const { value: options, isVar } = useParseSpcOptions(props.value);
  const onChange = props.onChange;

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
          { name: 'ucl_Rbar', color: 'red', title: allSpcParamsDict.ucl_Rbar, lineWidth: 2 },
          { name: 'lcl_Rbar', color: 'red', title: allSpcParamsDict.lcl_Rbar, lineWidth: 2 },
          { name: 'mean', color: 'blue', title: allSpcParamsDict.mean, lineWidth: 2 },
        ],
      },
    },
    RChart: {
      sampleSize: 5,
      aggregation: 'range',
      constantsConfig: {
        items: [
          { name: 'ucl', color: 'red', title: allSpcParamsDict.ucl, lineWidth: 2 },
          { name: 'lcl', color: 'red', title: allSpcParamsDict.lcl, lineWidth: 2 },
          { name: 'mean', color: 'blue', title: allSpcParamsDict.mean, lineWidth: 2 },
        ],
      },
    },
    xbarSChart: {
      sampleSize: 5,
      aggregation: 'mean',
      constantsConfig: {
        items: [
          { name: 'ucl_Sbar', color: 'red', title: allSpcParamsDict.ucl_Sbar, lineWidth: 2 },
          { name: 'lcl_Sbar', color: 'red', title: allSpcParamsDict.lcl_Sbar, lineWidth: 2 },
          { name: 'mean', color: 'blue', title: allSpcParamsDict.mean, lineWidth: 2 },
        ],
      },
    },
    SChart: {
      sampleSize: 5,
      aggregation: 'standardDeviation',
      constantsConfig: {
        items: [
          { name: 'ucl', color: 'red', title: allSpcParamsDict.ucl, lineWidth: 2 },
          { name: 'lcl', color: 'red', title: allSpcParamsDict.lcl, lineWidth: 2 },
          { name: 'mean', color: 'blue', title: allSpcParamsDict.mean, lineWidth: 2 },
        ],
      },
    },
    xmr: {
      sampleSize: 1,
      aggregation: 'mean',
      chartType: 'timeseries',
      constantsConfig: {
        items: [
          { name: 'ucl_x', color: 'red', title: allSpcParamsDict.ucl_x, lineWidth: 2 },
          { name: 'lcl_x', color: 'red', title: allSpcParamsDict.lcl_x, lineWidth: 2 },
          { name: 'mean', color: 'blue', title: allSpcParamsDict.mean, lineWidth: 2 },
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
              if (e.value !== undefined) {
                const { sampleSize, aggregation, constantsConfig } = presetChartOptionsMap[e.value];
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
