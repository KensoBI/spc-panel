import { AggregationType } from 'types';

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
};
export type SpcParam = keyof typeof allSpcParamsDict;

export function availableSpcParams(sampleSize: number, aggregationType: AggregationType): SpcParam[] {
  const params: SpcParam[] = ['nominal', 'lsl', 'usl', 'min', 'max', 'mean', 'range'];
  if (sampleSize > 1) {
    if (aggregationType === 'mean') {
      params.push('lcl_Rbar', 'ucl_Rbar', 'lcl_Sbar', 'ucl_Sbar');
    } else {
      params.push('lcl', 'ucl');
    }
  }
  return params;
}

const keySet = new Set(Object.keys(allSpcParamsDict));
export function isSpcParam(key: string): key is SpcParam {
  return keySet.has(key);
}
export function filterSpcParams(params: string[]): SpcParam[] {
  return params.filter((param) => isSpcParam(param)) as SpcParam[];
}
