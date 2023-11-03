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
export type ConstantsConfig = {
  items: ConstantConfigItem[];
};

export interface PanelOptions {
  limitConfig?: LimitConfig;
  constantsConfig?: ConstantsConfig;
}

export const defaultPanelOptions: PanelOptions = {
  limitConfig: undefined,
  constantsConfig: undefined,
};

export interface ChartPanelProps extends PanelProps<PanelOptions> {}
