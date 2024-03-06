import { css } from '@emotion/css';
import { StandardEditorProps, GrafanaTheme2, SelectableValue } from '@grafana/data';
import { useStyles2, InlineField, Select } from '@grafana/ui';
import { InputFloat } from 'components/InputFloat';
import React from 'react';
import { AggregationType, PanelOptions, SpcOptions, defaultSpcOptons } from 'types';
import { useParseSpcOptions } from './parseOptions';

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
export function SpcOptionEditor(props: Props) {
  const styles = useStyles2(getStyles);

  const { value: options, isVar } = useParseSpcOptions(props.value);
  const [customOptions, setCustomOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const onChange = props.onChange;

  return (
    <>
      <div className={styles.row}>
        <InlineField label="Sample size" disabled={isVar}>
          <Select
            options={[...sampleSizeOptions, ...customOptions]}
            placeholder={options.sampleSize.toString()}
            value={options.sampleSize}
            onChange={(v) => {
              const newSampleSize = v.value ?? 1;
              const newSpc: SpcOptions = { ...options, sampleSize: newSampleSize };
              if (newSampleSize === 1) {
                newSpc.aggregation = 'mean';
              }
              onChange({ ...options, sampleSize: newSampleSize });
            }}
            width={'auto'}
            allowCustomValue={true}
            onCreateOption={(v) => {
              const customValue: SelectableValue<number> = { value: parseInt(v, 10), label: v.toString() };
              setCustomOptions([customValue]);
              onChange({ ...options, sampleSize: customValue.value ?? 1 });
            }}
          />
        </InlineField>
        {options.sampleSize !== 1 && (
          <InlineField label="Aggregation type" disabled={false}>
            <Select
              placeholder={defaultAggregationType?.label}
              options={aggregationTypeOptions}
              value={options.aggregation}
              onChange={(e) => {
                if (!isCalculationType(e.value)) {
                  return;
                }
                onChange({ ...options, aggregation: e.value });
              }}
              width={'auto'}
            />
          </InlineField>
        )}
      </div>
      <div className={styles.row}>
        <InlineField label={'Nominal'}>
          <InputFloat
            placeholder={'Enter value'}
            value={options?.nominal}
            onChange={(val) => {
              onChange({ ...options, nominal: val });
            }}
            width={12}
          />
        </InlineField>
        <InlineField label={'LSL'}>
          <InputFloat
            placeholder={'Enter value'}
            value={options?.lsl}
            onChange={(val) => {
              onChange({ ...options, lsl: val });
            }}
            width={12}
          />
        </InlineField>
        <InlineField label={'USL'}>
          <InputFloat
            placeholder={'Enter value'}
            value={options?.usl}
            onChange={(val) => {
              onChange({ ...options, usl: val });
            }}
            width={12}
          />
        </InlineField>
      </div>
      {options.sampleSize > 10 ? (
        <span className="css-zjkzrp-Label-description">
          UCL and LCL calculations for Sample size &gt; 10 are not supported.
        </span>
      ) : (
        <></>
      )}
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
