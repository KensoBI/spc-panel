import { PanelProps } from '@grafana/data';

export type ConstantConfigItem = {
  name: string;
  color: string;
  title: string;
};

export type LimitConfigItem = {
  name: string;
  color: string;
};

export type LimitConfig = {
  up?: LimitConfigItem;
  down?: LimitConfigItem;
};
export type ConstantConfig = {
 item: ConstantConfigItem;
}

export interface PanelOptions {
  limitConfig?: LimitConfig;
  constantConfig?: ConstantConfig;
}

export const defaultPanelOptions: PanelOptions = {
  limitConfig: undefined,
  constantConfig: undefined,
};

export interface ChartPanelProps extends PanelProps<PanelOptions> {}
