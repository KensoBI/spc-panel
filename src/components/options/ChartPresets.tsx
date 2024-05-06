import { css } from '@emotion/css';
import { StandardEditorProps, GrafanaTheme2 } from '@grafana/data';
import { useStyles2, InlineField, Select } from '@grafana/ui';
import React from 'react';
import { SpcOptions, PanelOptions, PresetChartType } from 'types';
import { useParseSpcOptions } from './parseOptions';

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
    xbarRChart: { sampleSize: 5, aggregation: 'mean' },
    RChart: { sampleSize: 5, aggregation: 'range' },
    xbarSChart: { sampleSize: 5, aggregation: 'mean' },
    SChart: { sampleSize: 5, aggregation: 'standardDeviation' },
    xmr: { sampleSize: 1, aggregation: 'mean', chartType: 'timeseries' },
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
                const { sampleSize, aggregation } = presetChartOptionsMap[e.value];
                onChange({ ...options, sampleSize, aggregation });
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
