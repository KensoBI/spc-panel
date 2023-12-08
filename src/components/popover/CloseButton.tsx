import React from 'react';
import { useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

type Props = {
  onClick?: () => void;
  style?: React.CSSProperties;
};

export function CloseButton({ onClick, style }: Props) {
  const styles = useStyles2(getStyles);
  return (
    <div className={styles.button} onClick={onClick} style={style}>
      <i className="fa fa-times" />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    button: css`
      position: absolute;
      right: 0;
      top: 0;
      border-radius: 50%;
      cursor: pointer;
      background: ${theme.colors.gradients.brandHorizontal};
      width: 18px;
      height: 18px;
      transform: translate(50%, -50%);
      z-index: 100;
      text-align: center;
      flex-direction: column;
      display: flex;
      justify-content: center;
      font-size: 9px;
      color: black;
      box-shadow: ${theme.shadows.z1};

      &:hover {
        background: ${theme.colors.gradients.brandVertical};
      }
    `,
  };
};
