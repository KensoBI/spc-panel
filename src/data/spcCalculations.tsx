import { AggregationType } from 'types';
import { calcConst } from './calcConst';

function calculateGroupedAverage(values: number[], sampleSize: number) {
  const reversedValues = [...values].reverse();
  const result: number[] = [];

  for (let i = 0; i < values.length; i += sampleSize) {
    const sum = reversedValues
      .slice(i, i + sampleSize)
      .reduce(
        (acc, currentValue) => acc + (typeof currentValue === 'number' && !isNaN(currentValue) ? currentValue : 0),
        0
      );

    const count = Math.min(sampleSize, values.length - i);
    const average = sum / count;

    result.push(average);
  }

  return result.reverse();
}
function calculateGroupedDifference(values: number[], sampleSize: number) {
  const reversedValues = [...values].reverse();
  const result: number[] = [];

  for (let i = 0; i < values.length; i += sampleSize) {
    const valuesInInterval = reversedValues.slice(i, i + sampleSize);

    const isValidNumber = (val: any) => typeof val === 'number' && !isNaN(val);

    const max = Math.max(...valuesInInterval.filter(isValidNumber));
    const min = Math.min(...valuesInInterval.filter(isValidNumber));

    const difference = max - min;

    result.push(difference);
  }

  return result.reverse();
}

function calculateGroupedStdDev(values: number[], sampleSize: number) {
  const reversedValues = [...values].reverse();
  const result: number[] = [];

  for (let i = 0; i < values.length; i += sampleSize) {
    const valuesInInterval = reversedValues.slice(i, i + sampleSize);

    const isValidNumber = (val: any) => typeof val === 'number' && !isNaN(val);

    // Filter valid numbers in the range
    const validValues = valuesInInterval.filter(isValidNumber);

    // Calculate the average
    const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;

    // Calculate the squares of differences from the mean
    const squaredDifferences = validValues.map((val) => Math.pow(val - mean, 2));

    // Calculate the average of the squares of the differences
    const meanSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0) / validValues.length;

    // Calculate the square root of the mean of the squares of the differences (standard deviation)
    const standardDeviation = Math.sqrt(meanSquaredDifferences);

    result.push(standardDeviation);
  }

  return result.reverse();
}

export function calcValueSampleSize(values: number[], sampleSize: number, aggType: AggregationType) {
  if (sampleSize === 1) {
    return values;
  }
  switch (aggType) {
    case 'range':
      return calculateGroupedDifference(values, sampleSize);
    case 'standardDeviation':
      return calculateGroupedStdDev(values, sampleSize);
    default:
    case 'mean':
      return calculateGroupedAverage(values, sampleSize);
  }
}

export function calcTimeSampleSize(time: number[], sampleSize: number) {
  if (sampleSize === 1) {
    return time;
  }
  return calculateGroupedAverage(time, sampleSize);
}

export function calcMax(values: number[]) {
  let maxValue: number | undefined;
  const maxInField = Math.max(...values);

  if (maxValue === undefined || maxInField > maxValue) {
    maxValue = maxInField;
  }

  return maxValue;
}

export function calcMin(values: number[]) {
  let minValue: number | undefined;
  const minInField = Math.min(...values);

  if (minValue === undefined || minInField < minValue) {
    minValue = minInField;
  }

  return minValue;
}

export function calcMean(values: number[]) {
  let sum = 0;
  for (const val of values) {
    sum += val;
  }
  const count = values.length;
  return sum / count;
}

export function calcRange(values: number[]) {
  return calcMax(values) - calcMin(values);
}

export function calcUcl(values: number[], aggType: AggregationType, sample: number) {
  if (sample > 1) {
    let row = calcConst[sample];
    switch (aggType) {
      case 'range':
        const colD4 = 8;
        const D4 = row[colD4];
        const Ucl_range = D4 * calcRange(values);
        return [Ucl_range];
      case 'standardDeviation':
        const colB3 = 5;
        const B3 = row[colB3];
        const Ucl_stdDev = B3 * stdDev(values, calcMean(values));
        return [Ucl_stdDev];
      default:
      case 'mean':
        const colA2 = 3;
        const colA3 = 4;

        const A2 = row[colA2];
        const A3 = row[colA3];

        const mean = calcMean(values);

        const Ucl_Rbar = mean + A2 * calcRange(values);
        const Ucl_Sbar = mean + A3 * stdDev(values, mean);

        return [Ucl_Rbar, Ucl_Sbar];
    }
  }
  return;
}

export function calcLcl(values: number[], aggType: AggregationType, sample: number) {
  if (sample) {
    let row = calcConst[sample];
    switch (aggType) {
      case 'range':
        const colD3 = 7;
        const D3 = row[colD3];

        const Lcl_range = D3 * calcRange(values);

        return [Lcl_range];
      case 'standardDeviation':
        const colB4 = 6;
        const B4 = row[colB4];
        const Lcl_stdDev = B4 * stdDev(values, calcMean(values));

        return [Lcl_stdDev];
      default:
      case 'mean':
        const colA2 = 3;
        const colA3 = 4;
        const A2 = row[colA2];
        const A3 = row[colA3];
        const mean = calcMean(values);

        const Lcl_Rbar = mean - A2 * calcRange(values);
        const Lcl_Sbar = mean - A3 * stdDev(values, mean);

        return [Lcl_Rbar, Lcl_Sbar];
    }
  }
  return;
}

export function stdDev(values: number[], mean: number) {
  const squaredDifferences = values.map((val) => Math.pow((val as number) - mean, 2));
  const meanSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
  const standardDeviation = Math.sqrt(meanSquaredDifferences);

  return standardDeviation;
}
