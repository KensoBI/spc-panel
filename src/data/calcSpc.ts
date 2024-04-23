import { AggregationType, ConstantsConfig, MAX_DEFAULT_SAMPLE_SIZE, SpcOptions } from 'types';
import { Feature } from './types';
import { cloneDeep } from 'lodash';
import {
  calcClMr,
  calcClX,
  calcLcl,
  calcLclMr,
  calcLclX,
  calcMax,
  calcMean,
  calcMin,
  calcTimeSampleSize,
  calcUcl,
  calcUclMr,
  calcUclX,
  calcValueSampleSize,
} from './spcCalculations';
import { SpcParam, filterSpcParams } from './spcParams';

export function calcSpc(feature: Feature, spcOptions?: SpcOptions, constantsConfig?: ConstantsConfig) {
  const f = cloneDeep(feature);

  //first characteristics
  const characteristic = Object.values(f.characteristics)?.[0];
  if (characteristic == null || characteristic.timeseries == null) {
    return f;
  }

  let values = characteristic.timeseries.values.values;
  let times = characteristic.timeseries.time.values;
  if (!isNumberArray(values) || !isNumberArray(times)) {
    return f;
  }

  characteristic.timeseries.values.values = calcValueSampleSize(
    values,
    spcOptions?.sampleSize ?? 1,
    spcOptions?.aggregation ?? 'mean',
    spcOptions?.chartType ?? 'meanChart'
  );
  characteristic.timeseries.time.values = calcTimeSampleSize(
    times,
    spcOptions?.sampleSize ?? 1,
    spcOptions?.chartType ?? 'meanChart'
  );

  //clear obsolate, computed values from config
  //it's important, because otherwise the timeseries plot will be broken
  characteristic.timeseries.time.config = {};
  characteristic.timeseries.values.config = {};

  values = characteristic.timeseries.values.values;
  times = characteristic.timeseries.time.values;

  if (spcOptions?.nominal != null) {
    characteristic.table.nominal = spcOptions.nominal;
  }
  if (spcOptions?.lsl != null) {
    characteristic.table.lsl = spcOptions.lsl;
  }
  if (spcOptions?.usl != null) {
    characteristic.table.usl = spcOptions.usl;
  }

  if (constantsConfig == null) {
    return f;
  }

  const selected = new Set<SpcParam>(filterSpcParams(constantsConfig.items.map((item) => item.name)));

  if (selected.has('min')) {
    characteristic.table.min = calcMin(values);
  }

  if (selected.has('max')) {
    characteristic.table.max = calcMax(values);
  }

  if (selected.has('range')) {
    characteristic.table.range =
      (characteristic.table.max ?? calcMax(values)) - (characteristic.table.min ?? calcMin(values));
  }

  if (selected.has('mean')) {
    characteristic.table.mean = calcMean(values);
  }

  if (spcOptions == null) {
    return f;
  }

  const applyAggParam = (
    key: SpcParam,
    computeFunc: (values: any, aggType: AggregationType, sample: number) => number[] | undefined,
    additionalCond: boolean,
    resultIndex: number
  ) => {
    if (
      selected.has(key) &&
      spcOptions.sampleSize > 1 &&
      spcOptions.sampleSize <= MAX_DEFAULT_SAMPLE_SIZE &&
      additionalCond
    ) {
      let result = computeFunc(values, spcOptions.aggregation!, spcOptions.sampleSize);
      characteristic.table[key] = result ? result[resultIndex] : undefined;
    }
  };

  const aggNotMean = spcOptions.aggregation != null && spcOptions.aggregation !== 'mean';
  const aggIsMean = spcOptions.aggregation === 'mean';

  applyAggParam('lcl', calcLcl, aggNotMean, 0);
  applyAggParam('lcl_Rbar', calcLcl, aggIsMean, 0);
  applyAggParam('lcl_Sbar', calcLcl, aggIsMean, 1);
  applyAggParam('ucl', calcUcl, aggNotMean, 0);
  applyAggParam('ucl_Rbar', calcUcl, aggIsMean, 0);
  applyAggParam('ucl_Sbar', calcUcl, aggIsMean, 1);

  const applyNoAggParam = (
    key: SpcParam,
    computeFunc: (values: any) => any,
    chartType: string,
    defaultValue: any = undefined
  ) => {
    if (selected.has(key) && spcOptions.sampleSize === 1 && spcOptions.chartType === chartType) {
      let result = computeFunc(values);
      characteristic.table[key] = result ? result : defaultValue;
    }
  };

  applyNoAggParam('center_line_mr', calcClMr, 'mrChart');
  applyNoAggParam('ucl_mr', calcUclMr, 'mrChart');
  applyNoAggParam('lcl_mr', calcLclMr, 'mrChart', 0);
  applyNoAggParam('center_line_x', calcClX, 'meanChart');
  applyNoAggParam('ucl_x', calcUclX, 'meanChart');
  applyNoAggParam('lcl_x', calcLclX, 'meanChart');

  return f;
}

function isNumberArray(arr: any[]): arr is number[] {
  return arr.every((item) => typeof item === 'number');
}
