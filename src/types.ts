import { PanelProps } from '@grafana/data';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

export interface ChartPanelProps extends PanelProps<SimpleOptions> {}
