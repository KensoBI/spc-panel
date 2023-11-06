import React from 'react';
import { createPopper, Instance } from '@popperjs/core';
import { Portal, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

function ClickOutside({
  children,
  enabled,
  onClick,
}: React.PropsWithChildren<{ onClick: () => void; enabled: boolean }>) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    const click = (event: any) => {
      if (ref.current != null && !ref.current.contains(event.target)) {
        onClick();
      }
    };
    const t = setTimeout(() => window.addEventListener('click', click), 500);

    return () => {
      clearTimeout(t);
      window.removeEventListener('click', click);
    };
  }, [enabled, onClick]);

  return <div ref={ref}>{children}</div>;
}

export function usePopoverTrigger() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const onClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const triggerClick = React.useCallback((event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  return React.useMemo(
    () => ({
      popoverProps: {
        anchorEl: anchorEl,
        open: !!anchorEl,
        onClose,
      },
      triggerClick,
    }),
    [anchorEl, onClose, triggerClick]
  );
}

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  clickOutsideEnabled?: boolean;
};

export function Popover({
  children,
  open,
  anchorEl,
  onClose,
  clickOutsideEnabled = true,
}: React.PropsWithChildren<Props>) {
  const styles = useStyles2(getStyles);
  const [tooltipRef, setTooltipRef] = React.useState<HTMLElement | null>(null);
  const popperRef = React.useRef<Instance | null>();

  React.useEffect(() => {
    if (tooltipRef == null || anchorEl == null) {
      return;
    }

    const p = (popperRef.current = createPopper(anchorEl, tooltipRef, {
      placement: 'auto-end',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [10, 10],
          },
        },
      ],
      onFirstUpdate: () => {
        tooltipRef.style.setProperty('display', 'block');
        tooltipRef.style.setProperty('opacity', '1');
      },
    }));

    const ro = new ResizeObserver(() => p.update());
    ro.observe(tooltipRef);

    return () => {
      p.destroy();
      ro.disconnect();
    };
  }, [anchorEl, tooltipRef]);

  return (
    <>
      {open && (
        <Portal>
          <div ref={setTooltipRef} className={styles.container}>
            <ClickOutside enabled={clickOutsideEnabled} onClick={onClose}>
              {children}
            </ClickOutside>
          </div>
        </Portal>
      )}
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      opacity: 0;
      display: none;
      transition: opacity 300ms ease-out;
      width: auto;
      height: auto;
    `,
  };
};
