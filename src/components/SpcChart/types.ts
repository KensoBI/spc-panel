import { ConstantConfig, ConstantConfigItem, LimitConfig } from 'types';

export type TimeseriesSettings = {
  controlName: string;
  limitConfig?: LimitConfig;
  constantsConfig?: ConstantConfigItem[];
  constantConfig?: ConstantConfig;
  fill: number;
  lineWidth: number;
  pointSize: number;
  lineColor?: string;
  showLegend?: boolean;
  decimals?: number;
};

export const defaultTimeseriesSettingsColor = 'rgb(31, 96, 196)';
export const defaultTimeseriesSettings: TimeseriesSettings = {
  controlName: '',
  fill: 0,
  lineWidth: 2,
  pointSize: 6,
  lineColor: defaultTimeseriesSettingsColor,
  showLegend: false,
  decimals: 2,
};
