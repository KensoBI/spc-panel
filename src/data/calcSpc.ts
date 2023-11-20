import { ConstantsConfig, SpcOptions } from 'types';
import { Feature } from './types';
import { cloneDeep } from 'lodash';
import { calcLcl, calcMax, calcMean, calcMin, calcTimeSampleSize, calcUcl, calcValueSampleSize } from './spcCalculations';

export function calcSpc(feature: Feature, spcOptions?: SpcOptions, constantsConfig?: ConstantsConfig) {
  const f = cloneDeep(feature);

  //first characteristics
  const characteristic = Object.values(f.characteristics)?.[0];
  if (characteristic == null || characteristic.timeseries == null) {
    return f;
  }

  characteristic.timeseries.values = calcValueSampleSize(
    characteristic.timeseries.values,
    spcOptions?.sampleSize ?? 1,
    spcOptions?.aggregation ?? 'mean'
  );
  characteristic.timeseries.time = calcTimeSampleSize(
    characteristic.timeseries.time,
    spcOptions?.sampleSize ?? 1,
  )

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
    characteristic.table.min = calcMin(characteristic.timeseries.values);
  }

  if (selected.has('max')) {
    characteristic.table.max = calcMax(characteristic.timeseries.values);
  }

  if (selected.has('range')) {
    characteristic.table.range =
      (characteristic.table.max ?? calcMax(characteristic.timeseries.values)) -
      (characteristic.table.min ?? calcMin(characteristic.timeseries.values));
  }

  if (selected.has('mean')) {
    characteristic.table.mean = calcMean(characteristic.timeseries.values);
  }

  //TODO: add LCL and UCL 
  // Calculate LCL and UCL only when you enter lsl and usl values!
  if (selected.has('lcl') && spcOptions != null && spcOptions.sampleSize > 1 && spcOptions.aggregation != null && spcOptions.lsl != null && spcOptions.usl != null) {
    characteristic.table.lcl = calcLcl(
      characteristic.timeseries.values,
      characteristic.table.range,
      spcOptions.sampleSize
    );
  }
  if (selected.has('ucl') && spcOptions != null && spcOptions.sampleSize > 1 && spcOptions.aggregation != null && spcOptions.lsl != null && spcOptions.usl != null) {
    characteristic.table.ucl = calcUcl(
      characteristic.timeseries.values,
      characteristic.table.range,
      spcOptions.sampleSize
    );
  }

  return f;
}
