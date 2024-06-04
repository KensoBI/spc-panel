import { PanelProps } from '@grafana/data';
import { SpcParam } from 'data/spcParams';

export type ConstantConfigItem = {
  name: SpcParam | string;
  color: string;
  title: string;
  lineWidth: number;
};

export type LimitConfigItem = {
  name: string;
  color: string;
};

export type AggregationType = 'mean' | 'range' | 'standardDeviation';

export type PresetChartType = 'xbarRChart' | 'RChart' | 'xbarSChart' | 'SChart' | 'xmr';

export type ChartType = 'mrChart' | 'timeseries';

export type DrawStyleType = 'bars' | 'lines' | 'points' | 'line';

export type SpcOptions = {
  sampleSize: number;
  aggregation?: AggregationType;
  chartType?: ChartType;
  nominal?: number;
  lsl?: number;
  usl?: number;
  constantsConfig?: ConstantsConfig;
};

export type LimitConfig = {
  up?: LimitConfigItem;
  down?: LimitConfigItem;
};
export type ConstantsConfig = {
  items: ConstantConfigItem[];
};

export type TimeSeriesParams = {
  displayName?: string;
  min?: number;
  max?: number;
  decimals?: number;
  fill?: number;
  lineWidth?: number;
  pointSize?: number;
  lineColor?: string;
  showLegend?: boolean;
  drawStyle?: DrawStyleType;
};

export interface PanelOptions {
  limitConfig?: LimitConfig;
  timeseriesParams?: TimeSeriesParams;
  spcOptions?: SpcOptions;
}

export const defaultTimeseriesSettingsColor = 'rgb(31, 96, 196)';
export const defaultTimeseriesParams: TimeSeriesParams = {
  fill: 0,
  lineWidth: 2,
  pointSize: 6,
  lineColor: defaultTimeseriesSettingsColor,
  showLegend: true,
  drawStyle: 'line',
};

export const defaultSpcOptons: SpcOptions = {
  sampleSize: 1,
  aggregation: 'mean',
  chartType: 'timeseries',
  nominal: undefined,
  lsl: undefined,
  usl: undefined,
  constantsConfig: undefined,
};
export const defaultConstantColor = '#37872d';

export const MAX_DEFAULT_SAMPLE_SIZE = 10;

export const defaultPanelOptions: PanelOptions = {
  limitConfig: undefined,
  timeseriesParams: defaultTimeseriesParams,
  spcOptions: defaultSpcOptons,
};

export interface ChartPanelProps extends PanelProps<PanelOptions> {}
