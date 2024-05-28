import { ConstantsConfig, LimitConfig, SpcOptions, TimeSeriesParams, defaultTimeseriesSettingsColor } from 'types';

export type TimeseriesSettings = TimeSeriesParams & {
  controlName: string;
  limitConfig?: LimitConfig;
  constantsConfig?: ConstantsConfig;
  spcOptions?: SpcOptions;
};

export const defaultTimeseriesSettings: TimeseriesSettings = {
  controlName: '',
  fill: 0,
  lineWidth: 2,
  pointSize: 6,
  lineColor: defaultTimeseriesSettingsColor,
  showLegend: false,
};
