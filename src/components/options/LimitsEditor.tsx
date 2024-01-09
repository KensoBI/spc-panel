import React from 'react';
import { LimitConfig, LimitConfigItem, PanelOptions } from 'types';
import { GrafanaTheme2, StandardEditorProps } from '@grafana/data';
import { css } from '@emotion/css';
import { InlineField, Select, useStyles2 } from '@grafana/ui';
import { InlineColorField } from '../InlineColorField';
import { SpcParam, allSpcParamsDict } from 'data/spcParams';

const defaultColor = 'rgb(196, 22, 42)';

type Props = StandardEditorProps<LimitConfig, any, PanelOptions>;

export function LimitsEditor({ value, onChange, context }: Props) {
  const styles = useStyles2(getStyles);

  const characteristicKeys = context.instanceState?.characteristicKeys as string[] | null | undefined;

  const options = React.useMemo(() => {
    if (characteristicKeys == null) {
      return [];
    }
    return characteristicKeys.map((fieldName) => ({
      value: fieldName,
      label: allSpcParamsDict?.[fieldName as SpcParam] ?? fieldName,
    }));
  }, [characteristicKeys]);

  const setLimitConfig = (key: keyof NonNullable<LimitConfig>, item: LimitConfigItem | undefined) => {
    onChange({
      ...(value ?? {}),
      [key]: item,
    });
  };

  const setName = (key: keyof NonNullable<LimitConfig>, name: string | undefined) => {
    const item: LimitConfigItem | undefined =
      name != null
        ? {
            color: value?.[key]?.color ?? defaultColor,
            name,
          }
        : undefined;

    setLimitConfig(key, item);
  };

  const setColor = (key: keyof NonNullable<LimitConfig>, color: string) => {
    const name = value?.[key]?.name;
    if (name != null) {
      setLimitConfig(key, {
        name,
        color,
      });
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.row}>
          <InlineField label={'Upper threshold'}>
            <Select
              options={options}
              value={value?.up?.name}
              isClearable
              onChange={(selected) => {
                setName('up', selected?.value);
              }}
              width={'auto'}
            />
          </InlineField>

          {value?.up && (
            <InlineColorField
              color={value?.up?.color ?? defaultColor}
              onChange={(color) => {
                setColor('up', color);
              }}
            />
          )}
        </div>
        <div className={styles.row}>
          <InlineField label={'Lower threshold'}>
            <Select
              options={options}
              value={value?.down?.name}
              isClearable
              onChange={(selected) => {
                setName('down', selected?.value);
              }}
              width={'auto'}
            />
          </InlineField>
          {value?.down && (
            <InlineColorField
              color={value?.down?.color ?? defaultColor}
              onChange={(color) => {
                setColor('down', color);
              }}
            />
          )}
        </div>
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
      margin-top: ${theme.spacing(1)};
    `,
    row: css`
      display: flex;
      flex-wrap: wrap;
    `,
  };
};
