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
  decimals: 2,
};

export interface AnnotationsDataFrameViewDTO {
  id: string;
  /** @deprecate */
  dashboardId: number;
  dashboardUID: string;
  time: number;
  timeEnd: number;
  text: string;
  tags: string[];
  alertId?: number;
  newState?: string;
  title?: string;
  color: string;
  login?: string;
  avatarUrl?: string;
  isRegion?: boolean;
}
