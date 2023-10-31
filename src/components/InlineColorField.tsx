import React from 'react';
import { ColorPicker, InlineLabel, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

type Props = React.ComponentProps<typeof ColorPicker> & {
  label?: string;
};

export function InlineColorField(props: Props) {
  const styles = useStyles2(getStyles);
  const { label = 'Color' } = props;

  return (
    <div className={styles.colorField}>
      <InlineLabel className={styles.colorLabel}>{label}</InlineLabel>
      <div className={styles.colorButton}>
        <ColorPicker {...props} />
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  colorField: css`
    display: flex;
  `,
  colorLabel: css`
    flex: auto;
  `,
  colorButton: css`
    flex: 1;

    & > div {
      height: 100%;
    }

    & > button {
      margin-top: auto;
      margin-bottom: auto;
    }
  `,
});
