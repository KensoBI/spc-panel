import { ConstantsConfig, SpcOptions } from 'types';
import { Feature } from './types';
import { cloneDeep } from 'lodash';
import {
  calcLcl,
  calcMax,
  calcMean,
  calcMin,
  calcTimeSampleSize,
  calcUcl,
  calcValueSampleSize,
} from './spcCalculations';

export function calcSpc(feature: Feature, spcOptions?: SpcOptions, constantsConfig?: ConstantsConfig) {
  const f = cloneDeep(feature);

  //first characteristics
  const characteristic = Object.values(f.characteristics)?.[0];
  if (characteristic == null || characteristic.timeseries == null) {
    return f;
  }

  const values = characteristic.timeseries.values.values;
  const times = characteristic.timeseries.time.values;
  if (!isNumberArray(values) || !isNumberArray(times)) {
    return f;
  }

  characteristic.timeseries.values.values = calcValueSampleSize(
    values,
    spcOptions?.sampleSize ?? 1,
    spcOptions?.aggregation ?? 'mean'
  );
  characteristic.timeseries.time.values = calcTimeSampleSize(times, spcOptions?.sampleSize ?? 1);

  const newValues = characteristic.timeseries.values.values; 

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

  const selected = new Set(constantsConfig.items.map((item) => item.name));

  if (selected.has('min')) {
    characteristic.table.min = calcMin(newValues);
  }

  if (selected.has('max')) {
    characteristic.table.max = calcMax(newValues);
  }

  if (selected.has('range')) {
    characteristic.table.range =
      (characteristic.table.max ?? calcMax(newValues)) - (characteristic.table.min ?? calcMin(newValues));
  } 

  if (selected.has('mean')) {
    characteristic.table.mean = calcMean(newValues);
  }

  if (
    selected.has('lcl') &&
    spcOptions != null &&
    spcOptions.sampleSize > 1 &&
    spcOptions.aggregation != null &&
    spcOptions.aggregation !== 'mean'
  ) {
    let resultLcl = calcLcl(newValues, spcOptions.aggregation, spcOptions.sampleSize);
    characteristic.table.lcl = resultLcl ? resultLcl[0] : undefined;
  }
  if (
    selected.has('lcl_Rbar') &&
    spcOptions != null &&
    spcOptions.sampleSize > 1 &&
    spcOptions.aggregation === 'mean'
  ) {
    let resultLcl = calcLcl(newValues, spcOptions.aggregation, spcOptions.sampleSize);
    characteristic.table.lcl_Rbar = resultLcl ? resultLcl[0] : undefined;
  }
  if (
    selected.has('lcl_Sbar') &&
    spcOptions != null &&
    spcOptions.sampleSize > 1 &&
    spcOptions.aggregation === 'mean'
  ) {
    let resultLcl = calcLcl(newValues, spcOptions.aggregation, spcOptions.sampleSize);
    characteristic.table.lcl_Sbar = resultLcl ? resultLcl[1] : undefined;
  }
  if (
    selected.has('ucl') &&
    spcOptions != null &&
    spcOptions.sampleSize > 1 &&
    spcOptions.aggregation != null &&
    spcOptions.aggregation !== 'mean'
  ) {
    let resultUcl = calcUcl(newValues, spcOptions.aggregation, spcOptions.sampleSize);
    characteristic.table.ucl = resultUcl ? resultUcl[0] : undefined;
  }
  if (
    selected.has('ucl_Rbar') &&
    spcOptions != null &&
    spcOptions.sampleSize > 1 &&
    spcOptions.aggregation === 'mean'
  ) {
    let resultUcl = calcUcl(newValues, spcOptions.aggregation, spcOptions.sampleSize);
    characteristic.table.ucl_Rbar = resultUcl ? resultUcl[0] : undefined;
  }
  if (
    selected.has('ucl_Sbar') &&
    spcOptions != null &&
    spcOptions.sampleSize > 1 &&
    spcOptions.aggregation === 'mean'
  ) {
    let resultUcl = calcUcl(newValues, spcOptions.aggregation, spcOptions.sampleSize);
    characteristic.table.ucl_Sbar = resultUcl ? resultUcl[1] : undefined;
  }

  return f;
}

function isNumberArray(arr: any[]): arr is number[] {
  return arr.every((item) => typeof item === 'number');
}
