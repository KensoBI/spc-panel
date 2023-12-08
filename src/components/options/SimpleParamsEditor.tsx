import React from 'react';
import { TimeSeriesParams, PanelOptions, defaultTimeseriesSettingsColor } from 'types';
import { GrafanaTheme2, StandardEditorProps } from '@grafana/data';
import { css } from '@emotion/css';
import { InlineField, InlineSwitch, Input, Select, useStyles2 } from '@grafana/ui';
import { InlineColorField } from 'components/InlineColorField';
import { toNumber } from 'lodash';
import { selectableZeroToTen, selectableHalfToTen } from './selectableValues';

type Props = StandardEditorProps<TimeSeriesParams, any, PanelOptions>;

export function SimpleParamsEditor({ value, onChange }: Props) {
  const styles = useStyles2(getStyles);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.row}>
          <InlineField label={'Fill'} className={styles.noMargin}>
            <Select
              width={8}
              options={selectableZeroToTen}
              value={value.fill}
              onChange={(selected) => {
                if (selected?.value != null) {
                  onChange({ ...value, fill: selected.value });
                }
              }}
            />
          </InlineField>
          <InlineField label={'Line Width'} className={styles.noMargin}>
            <Select
              width={8}
              options={selectableZeroToTen}
              value={value.lineWidth}
              onChange={(selected) => {
                if (selected?.value != null) {
                  onChange({ ...value, lineWidth: selected.value });
                }
              }}
            />
          </InlineField>
          <InlineField label={'Point Radius'} className={styles.noMargin}>
            <Select
              width={8}
              options={selectableHalfToTen}
              value={value.pointSize}
              onChange={(selected) => {
                if (selected?.value != null) {
                  onChange({ ...value, pointSize: selected.value });
                }
              }}
            />
          </InlineField>
        </div>
        <div className={styles.rowNotFirst}>
          <InlineSwitch
            label="View legend"
            showLabel={true}
            value={value.showLegend}
            onChange={(e) => onChange({ ...value, showLegend: e.currentTarget.checked })}
          />
          <InlineField label={'Decimals'} className={styles.noMargin} grow>
            <Input
              value={value.decimals ?? ''}
              onChange={(e) => {
                let number = toNumber(e.currentTarget.value);
                const decimals =
                  e.currentTarget.value === '' || isNaN(number) ? undefined : Math.min(Math.max(number, 0), 6);
                onChange({ ...value, decimals });
              }}
              type="number"
              min={0}
              max={6}
              onFocus={(e) => e.currentTarget.select()}
              placeholder="Decimal places"
            />
          </InlineField>
          <div>
            <InlineColorField
              label="Line color"
              color={value.lineColor ?? defaultTimeseriesSettingsColor}
              onChange={(color) => {
                onChange({ ...value, lineColor: color });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  const row = css`
    display: flex;
    gap: ${theme.spacing(1)};
  `;
  return {
    container: css`
      background-color: ${theme.colors.background.canvas};
      padding: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius(2)};
      margin-top: ${theme.spacing(1)};
    `,
    row,
    rowNotFirst: css`
      ${row};
      margin-top: ${theme.spacing(1)};
    `,
    noMargin: css`
      margin: 0;
    `,
  };
};
