/* eslint-disable deprecation/deprecation */
import { Field, Vector } from '@grafana/data';

export function calcMax(value: Field<string, Vector<any>>) {
  let maxValue: number | undefined;
  //TODO check if all values are number
  const maxInField = Math.max(...value.values);

  if (maxValue === undefined || maxInField > maxValue) {
    maxValue = maxInField;
  }

  return maxValue;
}

export function calcMin(value: Field<string, Vector<any>>) {
  let minValue: number | undefined;
  //TODO check if all values are number
  const minInField = Math.min(...value.values);

  if (minValue === undefined || minInField < minValue) {
    minValue = minInField;
  }

  return minValue;
}

export function calcMean(value: Field<string, Vector<any>>) {
  //const sum = value.values.reduce((acc, val) => acc + val, 0);
  let sum = 0;
  for (const val of value.values) {
    sum += val;
  }
  const count = value.values.length;
  return sum / count;
}

export function calcRange(value: Field<string, Vector<any>>) {
  return calcMax(value) - calcMin(value);
}

export function calcUcl(value: Field<string, Vector<any>>) {
  const mean = calcMean(value);
  return mean + 3 * stdDev(value, mean);
}

export function calcLcl(value: Field<string, Vector<any>>) {
  const mean = calcMean(value);
  return mean - 3 * stdDev(value, mean);
}

export function stdDev(value: Field<string, Vector<any>>, mean: number) {
  const squaredDifferences = value.values.map((val) => Math.pow(val - mean, 2));
  const meanSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0) / value.values.length;
  const standardDeviation = Math.sqrt(meanSquaredDifferences);

  return standardDeviation;
}
