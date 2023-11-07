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

export type TimeSeriesParams = {
  fill?: number;
  lineWidth?: number;
  pointSize?: number;
  lineColor?: string;
  showLegend?: boolean;
  decimals?: number;
};

export interface PanelOptions {
  limitConfig?: LimitConfig;
  constantsConfig?: ConstantsConfig;
  timeseriesParams?: TimeSeriesParams;
}

export const defaultTimeseriesSettingsColor = 'rgb(31, 96, 196)';
export const defaultTimeseriesParams = {
  fill: 0,
  lineWidth: 2,
  pointSize: 6,
  lineColor: defaultTimeseriesSettingsColor,
  showLegend: false,
  decimals: 2,
};

export const defaultPanelOptions: PanelOptions = {
  limitConfig: undefined,
  constantsConfig: undefined,
  timeseriesParams: defaultTimeseriesParams,
};

export interface ChartPanelProps extends PanelProps<PanelOptions> {}
