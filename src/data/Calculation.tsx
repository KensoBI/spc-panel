/* eslint-disable deprecation/deprecation */
import { ArrayVector, Field, Vector } from '@grafana/data';
import { AggregationType } from 'types';
import { calcConst } from './calcConst';

function calculateGroupedAverage(value: Field<string, Vector<any>>, sampleSize: number): ArrayVector<number> {
  const reversedValues = [...value.values].reverse();
  const result: number[] = [];

  for (let i = 0; i < value.values.length; i += sampleSize) {
    const sum = reversedValues
      .slice(i, i + sampleSize)
      .reduce(
        (acc, currentValue) => acc + (typeof currentValue === 'number' && !isNaN(currentValue) ? currentValue : 0),
        0
      );

    const count = Math.min(sampleSize, value.values.length - i);
    const average = sum / count;

    result.push(average);
  }

  const arrayVector = new ArrayVector<number>(result.reverse());
  return arrayVector;
}
function calculateGroupedDifference(value: Field<string, Vector<any>>, sampleSize: number): ArrayVector<number> {
  const reversedValues = [...value.values].reverse();
  const result: number[] = [];

  for (let i = 0; i < value.values.length; i += sampleSize) {
    const valuesInInterval = reversedValues.slice(i, i + sampleSize);

    const isValidNumber = (val: any) => typeof val === 'number' && !isNaN(val);

    const max = Math.max(...valuesInInterval.filter(isValidNumber));
    const min = Math.min(...valuesInInterval.filter(isValidNumber));

    const difference = max - min;

    result.push(difference);
  }

  const arrayVector = new ArrayVector<number>(result.reverse());
  return arrayVector;
}

function calculateGroupedStdDev(value: Field<string, Vector<any>>, sampleSize: number): ArrayVector<number> {
  const reversedValues = [...value.values].reverse();
  const result: number[] = [];

  for (let i = 0; i < value.values.length; i += sampleSize) {
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

  const arrayVector = new ArrayVector<number>(result.reverse());
  return arrayVector;
}

export function calcValueSampleSize(
  value: Field<string, Vector<any>>,
  sampleSize: number,
  aggType: AggregationType
): Field<string, Vector<number>> {
  switch (aggType) {
    case 'range':
      const valueRange: Field<string, Vector<number>> = {
        ...value,
        values: calculateGroupedDifference(value, sampleSize),
      };

      return valueRange;
    case 'standardDeviation':
      const valueStdDev: Field<string, Vector<number>> = {
        ...value,
        values: calculateGroupedStdDev(value, sampleSize),
      };

      return valueStdDev;
    default:
    case 'mean':
      const valueMean: Field<string, Vector<number>> = {
        ...value,
        values: calculateGroupedAverage(value, sampleSize),
      };
      return valueMean;
  }
}

export function calcMax(value: Field<string, Vector<any>>) {
  let maxValue: number | undefined;
  const maxInField = Math.max(...value.values);

  if (maxValue === undefined || maxInField > maxValue) {
    maxValue = maxInField;
  }

  return maxValue;
}

export function calcMin(value: Field<string, Vector<any>>) {
  let minValue: number | undefined;
  const minInField = Math.min(...value.values);

  if (minValue === undefined || minInField < minValue) {
    minValue = minInField;
  }

  return minValue;
}

export function calcMean(value: Field<string, Vector<any>>) {
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

export function calcUcl(value: Field<string, Vector<any>>, aggType: AggregationType, sample: number) {
  if (sample > 1) {
    let row = calcConst[sample];
    switch (aggType) {
      case 'range':
        const colD4 = 8;
        const D4 = row[colD4];
        const Ucl_range = D4 * stdDev(value, calcMean(value));
        return [Ucl_range];
      case 'standardDeviation':
        const colB3 = 5;
        const B3 = row[colB3];
        const Ucl_stdDev = B3 * stdDev(value, calcMean(value));
        return [Ucl_stdDev];
      default:
      case 'mean':
        const colA2 = 3;
        const colA3 = 4;

        const A2 = row[colA2];
        const A3 = row[colA3];

        const mean = calcMean(value);

        const Ucl_Rbar = mean + A2 * calcRange(value);
        const Ucl_Sbar = mean + A3 * stdDev(value, mean);

        return [Ucl_Rbar, Ucl_Sbar];
    }
  }
  return undefined;
}

export function calcLcl(value: Field<string, Vector<any>>, aggType: AggregationType, sample: number) {
  if (sample) {
    let row = calcConst[sample];
    switch (aggType) {
      case 'range':
        const colD3 = 7;
        const D3 = row[colD3];

        const Lcl_range = D3 * stdDev(value, calcMean(value));

        return [Lcl_range];
      case 'standardDeviation':
        const colB4 = 6;
        const B4 = row[colB4];
        const Lcl_stdDev = B4 * stdDev(value, calcMean(value));

        return [Lcl_stdDev];
      default:
      case 'mean':
        const colA2 = 3;
        const colA3 = 4;
        const A2 = row[colA2];
        const A3 = row[colA3];
        const mean = calcMean(value);

        const Lcl_Rbar = mean - A2 * calcRange(value);
        const Lcl_Sbar = mean - A3 * stdDev(value, mean);

        return [Lcl_Rbar, Lcl_Sbar];
    }
  }
  return;
}

export function stdDev(value: Field<string, Vector<any>>, mean: number) {
  const squaredDifferences = value.values.map((val) => Math.pow(val - mean, 2));
  const meanSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0) / value.values.length;
  const standardDeviation = Math.sqrt(meanSquaredDifferences);

  return standardDeviation;
}

//-FUNKCJE PRZEPISANE NA useMemo !!!!!!!!! wyżej zostawione zwykłe funkcje liczące

//export function Calculation(
//  value: Field<string, Vector<any>>,
//  sample: number,
//  aggType: AggregationType,
//  lsl?: number,
//  usl?: number
//) {
//  const max = React.useMemo(() => {
//    return Math.max(...value.values);
//  }, [value]);
//
//  const min = React.useMemo(() => {
//    return Math.min(...value.values);
//  }, [value]);
//
//  const mean = React.useMemo(() => {
//    let sum = 0;
//    for (const val of value.values) {
//      sum += val;
//    }
//    return sum / value.values.length;
//  }, [value]);
//
//  const range = React.useMemo(() => {
//    return max - min;
//  }, [max, min]);
//
//  const stdDev = React.useMemo(() => {
//    //lety tempValue = value.values;
//    const squaredDifferences = value.values.map((val) => Math.pow(val - mean, 2));
//    const meanSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0) / value.values.length;
//    const standardDeviation = Math.sqrt(meanSquaredDifferences);
//
//    return standardDeviation;
//  }, [mean, value]);
//
//  const ucl = React.useMemo(() => {
//    if (lsl != null && usl != null && sample > 1) {
//      let row = calcConst[sample];
//      switch (aggType) {
//        case 'mean':
//          const colA2 = 3;
//          const colA3 = 4;
//
//          const A2 = row[colA2];
//          const A3 = row[colA3];
//
//          const Ucl_Rbar = mean + A2 * range;
//          const Ucl_Sbar = mean + A3 * stdDev;
//
//          return [Ucl_Rbar, Ucl_Sbar];
//        case 'range':
//          const colD4 = 8;
//          const D4 = row[colD4];
//          const Ucl_range = D4 * stdDev;
//          return [Ucl_range];
//        case 'standardDeviation':
//          const colB3 = 5;
//          const B3 = row[colB3];
//          const Ucl_stdDev = B3 * stdDev;
//          return [Ucl_stdDev];
//      }
//    } else {
//      return undefined;
//    }
//  }, [aggType, lsl, mean, range, sample, stdDev, usl]);
//
//  const lcl = React.useMemo(() => {
//    if (lsl != null && usl != null && sample > 1) {
//      let row = calcConst[sample];
//      switch (aggType) {
//        case 'mean':
//          const colA2 = 3;
//          const colA3 = 4;
//          const A2 = row[colA2];
//          const A3 = row[colA3];
//
//          const Lcl_Rbar = mean - A2 * mean;
//          const Lcl_Sbar = mean - A3 * stdDev;
//
//          return [Lcl_Rbar, Lcl_Sbar];
//        case 'range':
//          const colD3 = 7;
//          const D3 = row[colD3];
//
//          const Lcl_range = D3 * stdDev;
//
//          return [Lcl_range];
//        case 'standardDeviation':
//          const colB4 = 6;
//          const B4 = row[colB4];
//          const Lcl_stdDev = B4 * stdDev;
//
//          return [Lcl_stdDev];
//      }
//    } else {
//      return undefined;
//    }
//  }, [aggType, lsl, mean, sample, stdDev, usl]);
//  return [max, min, mean, range, ucl, lcl];
//}
