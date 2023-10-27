import { DecimalCount, GrafanaTheme2, TimeZone } from '@grafana/data';
import { AxisPlacement, ScaleDistribution } from '@grafana/ui';

//import {AxisProps} from '@grafana/ui';
//Workaround of following error:
//Module '"@grafana/ui"' declares 'AxisProps' locally, but it is not exported.
export interface AxisPropsReflection {
  scaleKey: string;
  theme: GrafanaTheme2;
  label?: string;
  show?: boolean;
  size?: number | null;
  gap?: number;
  tickLabelRotation?: number;
  placement?: AxisPlacement;
  grid?: any; //Axis.Grid;
  ticks?: any; //Axis.Ticks;
  filter?: any; //Axis.Filter;
  space?: any; //Axis.Space;
  formatValue?: (v: any, decimals?: DecimalCount) => string;
  incrs?: any; //Axis.Incrs;
  splits?: any; //Axis.Splits;
  values?: any; //Axis.Values;
  isTime?: boolean;
  timeZone?: TimeZone;
  color?: any; //uPlot.Axis.Stroke;
  border?: any; //uPlot.Axis.Border;
  decimals?: DecimalCount;
  distr?: ScaleDistribution;
}
