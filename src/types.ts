import { PanelProps } from '@grafana/data';

export type LimitConfigItem = {
  name: string;
  color: string;
};

export type LimitConfig = {
  up?: LimitConfigItem;
  down?: LimitConfigItem;
};

export interface PanelOptions {
  limitConfig?: LimitConfig;
}

export const defaultPanelOptions: PanelOptions = {
  limitConfig: undefined,
};

export interface ChartPanelProps extends PanelProps<PanelOptions> {}
