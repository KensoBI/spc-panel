import { PanelProps } from '@grafana/data';

export type ConstantConfigItem = {
  name: string;
  color: string;
  title: string;
  lineWidth: number;
};

export type LimitConfigItem = {
  name: string;
  color: string;
};

export type AggregationType = 'mean' | 'range' | 'standardDeviation';

export type SpcOptions = {
  sampleSize: number;
  aggregation?: AggregationType;
  nominal?: number;
  lsl?: number;
  usl?: number;
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
  spcOptions?: SpcOptions;
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

export const defaultSpcOptons: SpcOptions = {
  sampleSize: 1,
  aggregation: 'mean',
  nominal: undefined,
  lsl: undefined,
  usl: undefined,
};
export const defaultConstantColor = '#37872d';

export const defaultConstantOptions: ConstantsConfig = {
  items: [
    {
      name: '',
      color: defaultConstantColor,
      title: '',
      lineWidth: 2,
    },
  ],
};

export const defaultPanelOptions: PanelOptions = {
  limitConfig: undefined,
  constantsConfig: undefined,
  timeseriesParams: defaultTimeseriesParams,
  spcOptions: defaultSpcOptons,
};

export interface ChartPanelProps extends PanelProps<PanelOptions> {}
