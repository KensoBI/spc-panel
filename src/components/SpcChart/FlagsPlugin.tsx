import React from 'react';
import uPlot from 'uplot';

import { colorManipulator } from '@grafana/data';
import { getTextColorForBackground, UPlotConfigBuilder, useTheme2 } from '@grafana/ui';

const DEFAULT_TIMESERIES_FLAG_COLOR = '#03839e';

export type FlagInfo = {
  title?: string;
  color?: string;
};

export type Flag = FlagInfo & {
  type: 'flag';
  time: number;
};

export type Region = FlagInfo & {
  type: 'region';
  timeStart?: number;
  timeEnd?: number;
};

export type FlagEntity = Flag | Region;

export type FlagsPluginProps = {
  config: UPlotConfigBuilder;
  flags: FlagEntity[];
};

type ConditionFunc = {
  func: (xPos: number) => boolean;
  flag: FlagEntity;
  x: number;
};
type Conditions = ConditionFunc[];

type TooltipState = {
  x: number;
  flag: FlagEntity;
  position: 'left' | 'center' | 'right';
};

export function isFlagEntity(value: any): value is FlagEntity {
  return (value?.type === 'flag' && typeof value?.time === 'number') || value?.type === 'region';
}

export function isFlagEntityArray(value: any): value is FlagEntity[] {
  if (!Array.isArray(value)) {
    return false;
  }
  for (const en of value) {
    if (!isFlagEntity(en)) {
      return false;
    }
  }
  return true;
}

export const FlagsPlugin: React.FC<FlagsPluginProps> = ({ flags, config }) => {
  const theme = useTheme2();

  const [tooltip, setTooltip] = React.useState<TooltipState | null>(null);

  const plotInstance = React.useRef<uPlot>();
  const flagsRef = React.useRef<FlagEntity[]>();

  // Update flags views when new flags came
  React.useEffect(() => {
    flagsRef.current = flags.sort((a, b) => typeToValue(b.type) - typeToValue(a.type));
  }, [flags]);

  React.useLayoutEffect(() => {
    let bbox: DOMRect | undefined = undefined;
    let conditions: Conditions = [];

    const onMouseCapture = (e: MouseEvent) => {
      if (bbox) {
        const x = e.clientX - bbox.left;

        for (const cond of conditions) {
          if (cond.func(x)) {
            setTooltip((prev) => {
              if (prev?.flag === cond.flag) {
                return prev;
              }
              let position: TooltipState['position'] = 'center';

              if (bbox?.width) {
                if (cond.x < 0.2 * bbox.width) {
                  position = 'right';
                } else if (cond.x > 0.8 * bbox.width) {
                  position = 'left';
                }
              }

              return {
                flag: cond.flag,
                x: cond.x,
                position,
              };
            });
            return;
          }
        }
        setTooltip(null);
      }
    };

    const plotLeave = () => {
      setTooltip(null);
    };

    config.addHook('init', (u) => {
      plotInstance.current = u;

      u.root.parentElement?.addEventListener('blur', plotLeave);
      u.over.addEventListener('mouseleave', plotLeave);

      const canvas = u.over;

      canvas?.addEventListener('mousemove', onMouseCapture);
    });

    config.addHook('syncRect', (u, rect) => {
      bbox = rect;
    });

    config.addHook('draw', (u) => {
      // Render flag lines on the canvas
      /**
       * We cannot rely on state value here, as it would require this effect to be dependent on the state value.
       */
      if (!flagsRef.current) {
        return null;
      }

      const ctx = u.ctx;
      if (!ctx) {
        return;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
      ctx.clip();

      const renderLine = (value: number | undefined, color: string) => {
        if (value == null) {
          return;
        }
        const x = u.valToPos(value, 'x', true);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x, u.bbox.top);
        ctx.lineTo(x, u.bbox.top + u.bbox.height);
        ctx.stroke();
        ctx.closePath();
      };

      const renderRect = (valStart: number | undefined, valEnd: number | undefined, color: string) => {
        const x0 = valStart != null ? u.valToPos(valStart, 'x', true) : u.bbox.left;
        const x1 = valEnd != null ? u.valToPos(valEnd, 'x', true) : u.bbox.left + u.bbox.width;
        ctx.fillStyle = colorManipulator.alpha(color, 0.1);
        ctx.rect(x0, u.bbox.top, x1 - x0, u.bbox.height);
        ctx.fill();
      };

      for (let i = 0; i < flagsRef.current.length; i++) {
        const entity = flagsRef.current[i];
        const lineColor = entity.color ?? DEFAULT_TIMESERIES_FLAG_COLOR;
        if (entity.type === 'flag') {
          renderLine(entity.time, lineColor);
          const xCssPixelPosition = u.valToPos(entity.time, 'x', false);

          conditions.push({
            flag: entity,
            func: inRange(xCssPixelPosition, 30),
            x: xCssPixelPosition + u.over.offsetLeft,
          });
        } else if (entity.type === 'region') {
          renderLine(entity.timeStart, lineColor);
          renderLine(entity.timeEnd, lineColor);
          renderRect(entity.timeStart, entity.timeEnd, lineColor);

          const x0CssPixelPosition = entity.timeStart ? u.valToPos(entity.timeStart, 'x', false) : undefined;
          const x1CssPixelPosition = entity.timeEnd ? u.valToPos(entity.timeEnd, 'x', false) : undefined;

          const x = x0CssPixelPosition ?? x1CssPixelPosition ?? u.over.clientWidth / 2;

          conditions.push({
            flag: entity,
            func: rectInRange(x0CssPixelPosition ?? 0, x1CssPixelPosition ?? u.over.clientWidth, 30),
            x: x + u.over.offsetLeft,
          });
        }
      }
      ctx.restore();

      return () => {
        if (plotInstance.current) {
          plotInstance.current.over.removeEventListener('mouseleave', plotLeave);
          plotInstance.current.root.parentElement?.removeEventListener('blur', plotLeave);
        }
      };
    });
  }, [config, theme]);

  if (!tooltip) {
    return <></>;
  }

  const backgroundColor = tooltip.flag.color ?? DEFAULT_TIMESERIES_FLAG_COLOR;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: tooltip.x,
        color: getTextColorForBackground(backgroundColor),
        transform: `translateX(${tooltip.position === 'center' ? -50 : tooltip.position === 'left' ? -100 : 0}%)`,
        backgroundColor,
        paddingLeft: 3,
        paddingRight: 3,
        fontSize: 12,
        borderRadius: 2,
      }}
    >
      {tooltip.flag.title ?? 'EMPTY'}
    </div>
  );
};

const inRange = (value: number, range: number) => (vPos: number) => {
  return vPos >= value - range && vPos <= value + range;
};

const rectInRange = (valueStart: number, valueEnd: number, range: number) => (vPos: number) => {
  return vPos >= valueStart - range && vPos <= valueEnd + range;
};

const typeToValue = (type: FlagEntity['type']) => {
  switch (type) {
    case 'flag':
      return 2;
    case 'region':
      return 1;
    default:
      return 0;
  }
};
