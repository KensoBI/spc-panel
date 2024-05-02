import { AggregationType, ChartType, MAX_DEFAULT_SAMPLE_SIZE } from 'types';

export const allSpcParamsDict = {
  nominal: 'Nominal',
  lsl: 'LSL',
  usl: 'USL',
  min: 'Min',
  max: 'Max',
  mean: 'Mean',
  range: 'Range',
  lcl_Rbar: 'LCL R-bar',
  ucl_Rbar: 'UCL R-bar',
  lcl_Sbar: 'LCL S-bar',
  ucl_Sbar: 'UCL S-bar',
  lcl: 'LCL',
  ucl: 'UCL',
  lcl_mr: 'LCL - MR chart',
  ucl_mr: 'UCL - MR chart',
  lcl_x: 'LCL - X chart',
  ucl_x: 'UCL - X chart',
};
export type SpcParam = keyof typeof allSpcParamsDict;

function mergeArraysUniqueValues(arr1: string[], arr2: string[]): string[] {
  const uniqueSet = new Set([...arr1, ...arr2]);
  const resultArray: string[] = Array.from(uniqueSet);

  return resultArray;
}

export function availableSpcParams(
  sampleSize: number,
  aggregationType: AggregationType,
  chartType: ChartType
): SpcParam[] {
  const params: SpcParam[] = ['nominal', 'lsl', 'usl', 'min', 'max', 'mean', 'range'];
  if (sampleSize > 1 && sampleSize <= MAX_DEFAULT_SAMPLE_SIZE) {
    if (aggregationType === 'mean') {
      params.push('lcl_Rbar', 'ucl_Rbar', 'lcl_Sbar', 'ucl_Sbar');
    } else {
      params.push('lcl', 'ucl');
    }
  } else {
    if (sampleSize === 1 && chartType === 'mrChart') {
      params.push('lcl_mr', 'ucl_mr');
    } else if (sampleSize === 1 && chartType === 'timeseries') {
      params.push('lcl_x', 'ucl_x');
    }
  }
  return params;
}
export function availableSpcParamsWithData(
  sampleSize: number,
  aggregationType: AggregationType,
  characteristicKeys: any,
  chartType: ChartType
): string[] {
  const params: SpcParam[] = ['nominal', 'lsl', 'usl', 'min', 'max', 'mean', 'range'];
  if (sampleSize > 1 && sampleSize <= MAX_DEFAULT_SAMPLE_SIZE) {
    if (aggregationType === 'mean') {
      params.push('lcl_Rbar', 'ucl_Rbar', 'lcl_Sbar', 'ucl_Sbar');
    } else {
      params.push('lcl', 'ucl');
    }
  } else {
    if (sampleSize === 1 && chartType === 'mrChart') {
      params.push('lcl_mr', 'ucl_mr');
    } else if (sampleSize === 1 && chartType === 'timeseries') {
      params.push('lcl_x', 'ucl_x');
    }
  }
  const mergedArray = mergeArraysUniqueValues(params, characteristicKeys);
  return mergedArray;
}

const keySet = new Set(Object.keys(allSpcParamsDict));
export function isSpcParam(key: string): key is SpcParam {
  return keySet.has(key);
}
export function filterSpcParams(params: string[]): SpcParam[] {
  return params.filter((param) => isSpcParam(param)) as SpcParam[];
}
