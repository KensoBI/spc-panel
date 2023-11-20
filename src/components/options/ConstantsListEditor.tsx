import { Button, InlineField, Select, useStyles2 } from '@grafana/ui';
import React from 'react';
import { PopoverContainer } from 'components/popover/PopoverContainer';
import { css } from '@emotion/css';
import { GrafanaTheme2, StandardEditorProps } from '@grafana/data';
import { Popover, usePopoverTrigger } from 'components/popover/Popover';
import { CloseButton } from 'components/popover/CloseButton';
import { MenuItem } from 'components/popover/MenuItem';
import { ConstantsConfig, PanelOptions, defaultConstantColor } from 'types';
import { Characteristic } from 'data/types';
import { InlineColorField } from 'components/InlineColorField';
import { difference, uniqBy } from 'lodash';
import { options_0 } from './types';

type Props = StandardEditorProps<ConstantsConfig | undefined, any, PanelOptions>;

export function ConstantsListEditor({ value, onChange, context }: Props) {
  const styles = useStyles2(getStyles);
  const selectedCharacteristic = context.instanceState?.selectedCharacteristic as Characteristic | null | undefined;
  const hasTableData = context.instanceState?.hasTableData as boolean | null | undefined;
  const prevAvailableFields = React.useRef<string[] | null>(null);

  const availableFields = React.useMemo(() => {
    if (selectedCharacteristic == null) {
      return [];
    }
    if (!hasTableData) {
      const sampleSize = context.options?.spcOptions?.sampleSize ?? 1;
      return ['nominal', 'lsl', 'usl', 'min', 'max', 'mean', 'range', ...(sampleSize > 1 ? ['lcl', 'ucl'] : [])];
    }
    return Object.keys(selectedCharacteristic.table);
  }, [context.options?.spcOptions?.sampleSize, hasTableData, selectedCharacteristic]);

  React.useEffect(() => {
    if (availableFields.length === 0 || !hasTableData) {
      return;
    }
    if (prevAvailableFields.current != null) {
      const newFields = difference(availableFields, prevAvailableFields.current);

      if (newFields.length > 0) {
        const items = uniqBy(
          [
            ...(value?.items ?? []),
            ...newFields.map((fieldName) => ({
              name: fieldName,
              title: fieldName,
              color: defaultConstantColor,
              lineWidth: 2,
            })),
          ],
          'name'
        );

        onChange({
          ...value,
          items,
        });
      }
    }

    prevAvailableFields.current = [...availableFields];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFields]);

  const notSelectedFields = React.useMemo(() => {
    return difference(availableFields, value?.items?.map((conf) => conf.name) ?? []);
  }, [availableFields, value?.items]);

  const { popoverProps, triggerClick } = usePopoverTrigger();

  const menu = React.useMemo(() => {
    return (
      <PopoverContainer>
        {notSelectedFields?.map((fieldName) => (
          <MenuItem
            key={fieldName}
            onClick={() => {
              onChange({
                ...value,
                items: [
                  ...(value?.items ?? []),
                  {
                    name: fieldName,
                    title: fieldName,
                    color: defaultConstantColor,
                    lineWidth: 2,
                  },
                ],
              });
              popoverProps.onClose();
            }}
          >
            {fieldName}
          </MenuItem>
        ))}
      </PopoverContainer>
    );
  }, [notSelectedFields, onChange, popoverProps, value]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h5>{!value?.items?.length ? <i>Empty</i> : <></>}</h5>
          </div>

          <Button
            disabled={notSelectedFields.length === 0}
            onClick={triggerClick}
            icon="plus-circle"
            variant="success"
            fill="text"
            size="sm"
          >
            Add
          </Button>
        </div>

        {value?.items?.map((el, index) => (
          <div key={el.title} className={styles.row}>
            <div className={styles.fieldName}>{el.title}</div>
            <div>
              <input
                className={styles.titleInput}
                type="text"
                value={el?.title}
                onChange={(e) => {
                  if (value.items) {
                    value.items[index].title = e.target.value;
                  }
                  onChange({ ...value });
                }}
              />
            </div>
            <div className={styles.rightColumn}>
              <InlineField label={'Line Width'} className={styles.noMargin}>
                <Select
                  width={8}
                  options={options_0}
                  value={el.lineWidth}
                  onChange={(selected) => {
                    if (selected?.value != null) {
                      value.items[index].lineWidth = selected.value;
                      onChange({ ...value });
                    }
                  }}
                />
              </InlineField>
              <InlineColorField
                color={el?.color ?? defaultConstantColor}
                onChange={(newColor) => {
                  if (value.items) {
                    value.items[index].color = newColor;
                  }
                  onChange({ ...value });
                }}
              />
              <Button
                onClick={() => {
                  onChange({
                    ...value,
                    items: (value?.items ?? []).filter((conf) => conf.name !== el.name),
                  });
                }}
                icon="trash-alt"
                variant="destructive"
                fill="text"
              />
            </div>
          </div>
        ))}
        <div className={styles.addButtonContainer}></div>
      </div>
      <Popover {...popoverProps}>
        <CloseButton onClick={() => popoverProps.onClose()} style={{ background: 'black', color: 'white' }} />
        {menu}
      </Popover>
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
    header: css`
      display: flex;
    `,
    headerTitle: css`
      flex-grow: 1;
    `,
    titleInput: css`
      background: #0000;
      border-radius: 3px;
      box-shadow: none;
      font-weight: 600;
      padding: 0px 8px;
      resize: none;
      outline: none;
      display: block;
      -webkit-appearance: none;
      height: 100%;
      width: 100%;

      &:focus {
        background-color: ${theme.colors.background.canvas};
        box-shadow: inset 0 0 0 2px ${theme.colors.primary.border};
      }
    `,
    row: css`
      display: flex;
      gap: ${theme.spacing(0.5)};
      margin-top: ${theme.spacing(0.5)};

      & > div {
        flex: 1;
      }
    `,
    fieldName: css`
      margin-top: auto;
      margin-bottom: auto;
    `,
    rightColumn: css`
      min-width: 260px;
      display: flex;
      gap: ${theme.spacing(1)};
    `,
    addButtonContainer: css`
      display: flex;
      justify-content: center;
    `,
    noMargin: css`
      margin: 0;
    `,
  };
};
