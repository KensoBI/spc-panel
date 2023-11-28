import { css } from '@emotion/css';
import { StandardEditorProps, GrafanaTheme2 } from '@grafana/data';
import { useStyles2, InlineField, Select, Input } from '@grafana/ui';
import React from 'react';
import { AggregationType, PanelOptions, SpcOptions, defaultSpcOptons } from 'types';

const sampleSizeOptions = [...Array(10)]
  .map((_, i) => i + 1)
  .map((i) => ({
    label: `${i}`,
    value: i,
  }));
const aggregationTypeOptions: Array<{ label: string; value: AggregationType }> = [
  { label: 'Mean', value: 'mean' }, //default
  { label: 'Range', value: 'range' },
  { label: 'Standard deviation', value: 'standardDeviation' },
];
const defaultAggregationType = aggregationTypeOptions.find((option) => option.value === defaultSpcOptons.aggregation);

const isCalculationType = (value: unknown): value is AggregationType => {
  return typeof value === 'string' && aggregationTypeOptions.some((option) => option.value === value);
};

type Props = StandardEditorProps<SpcOptions, any, PanelOptions>;
export function SpcOptionEditor({ value, onChange }: Props) {
  const styles = useStyles2(getStyles);

  return (
    <>
      <div className={styles.row}>
        <InlineField label="Sample size" disabled={false}>
          <Select
            options={sampleSizeOptions}
            value={value.sampleSize}
            onChange={(e) => {
              const newSampleSize = e.value ?? 1;
              const newSpc: SpcOptions = { ...value, sampleSize: newSampleSize };
              if (newSampleSize === 1) {
                newSpc.aggregation = 'mean';
              }
              onChange({ ...value, sampleSize: newSampleSize });
            }}
            width={10}
          />
        </InlineField>
        {value.sampleSize !== 1 && (
          <InlineField label="Aggregation type" disabled={false}>
            <Select
              placeholder={defaultAggregationType?.label}
              options={aggregationTypeOptions}
              value={value.aggregation}
              onChange={(e) => {
                if (!isCalculationType(e.value)) {
                  return;
                }
                onChange({ ...value, aggregation: e.value });
              }}
              width={22}
            />
          </InlineField>
        )}
      </div>
      <div className={styles.row}>
        <InlineField label={'Nominal'}>
          <Input
            type={'number'}
            placeholder={'Enter value'}
            value={value?.nominal}
            onChange={(selected) => {
              const newNominal = parseFloat((selected?.target as HTMLInputElement)?.value ?? '');
              onChange({ ...value, nominal: newNominal });
            }}
            width={12}
          />
        </InlineField>
        <InlineField label={'LSL'}>
          <Input
            type={'number'}
            placeholder={'Enter value'}
            value={value?.lsl}
            onChange={(selected) => {
              const newLsl = parseFloat((selected?.target as HTMLInputElement)?.value ?? '');
              onChange({ ...value, lsl: newLsl });
            }}
            width={12}
          />
        </InlineField>
        <InlineField label={'USL'}>
          <Input
            type={'number'}
            placeholder={'Enter value'}
            value={value?.usl}
            onChange={(selected) => {
              const newUsl = parseFloat((selected?.target as HTMLInputElement)?.value ?? '');
              onChange({ ...value, usl: newUsl });
            }}
            width={12}
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
    `,
  };
};
