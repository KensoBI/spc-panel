import React from 'react';
import { useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

type Props = {};

export function PopoverContainer({ children }: React.PropsWithChildren<Props>) {
  const styles = useStyles2(getStyles);
  return <div className={styles.container}>{children}</div>;
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background: ${theme.colors.background.primary};
      box-shadow: ${theme.shadows.z3};
      display: inline-block;
      border-radius: ${theme.shape.borderRadius(3)};
      padding: ${theme.spacing(0.5, 0.5)};
      min-height: ${theme.spacing(4)};
      overflow-y: auto;
      max-height: 50vh;
      position: relative;
    `,
  };
};
