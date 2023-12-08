import React from 'react';
import { useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css, cx } from '@emotion/css';

type Props = {
  selected?: boolean;
  className?: string;
  onClick: () => void;
};

export function MenuItem({ children, selected = false, className, onClick }: React.PropsWithChildren<Props>) {
  const styles = useStyles2(getStyles);

  const containerStyle = cx(
    {
      [styles.container]: true,
      [styles.selected]: selected,
    },
    className
  );

  return (
    <div onClick={onClick} className={containerStyle}>
      {children}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background: none;
      cursor: pointer;
      white-space: nowrap;
      color: ${theme.colors.text.primary};
      display: flex;
      align-items: center;
      padding: ${theme.spacing(0.5, 1)};
      min-height: ${theme.spacing(4)};
      min-width: 100px;
      margin: 0;
      border: none;
      width: 100%;
      position: relative;

      &:hover,
      &:focus,
      &:focus-visible {
        background: ${theme.colors.action.hover};
        color: ${theme.colors.text.primary};
        text-decoration: none;
      }
    `,
    selected: css`
      background: ${theme.colors.action.selected};
    `,
  };
};
