import { DataFrame, FieldType } from '@grafana/data';
import { loadFeaturesByControl, loadSingleTimeseries, loadTimeseries, MappedFeatures } from './loadDataFrames';
import { Feature } from './types';

function isSimpleTimeseries(df: DataFrame) {
  const check = (timeIndex: number, valueIndex: number) => {
    return df.fields?.[timeIndex]?.type === FieldType.time && df.fields?.[valueIndex]?.type === FieldType.number;
  };
  return df.fields.length === 2 && (check(0, 1) || check(1, 0));
}

function timeFieldFirst(df: DataFrame) {
  const timeFieldIndex = df.fields.findIndex((field) => field.type === FieldType.time);
  if (timeFieldIndex === 0) {
    return df;
  }
  const fields = [...df.fields];
  const timeField = fields.splice(timeFieldIndex, 1);
  fields.unshift(timeField[0]);
  return { ...df, fields };
}

function isTimeseries(df: DataFrame) {
  return df.meta?.type === 'timeseries-wide' && df.fields?.[0]?.type === FieldType.time;
}

function hasColumn(df: DataFrame, name: string) {
  return df.fields.find((field) => field.name === name) != null;
}

function isFeaturesTable(df: DataFrame) {
  return hasColumn(df, 'feature') && hasColumn(df, 'control') && hasColumn(df, 'nominal');
}

function groupDataFrames(data: DataFrame[]) {
  const tables: DataFrame[] = [];
  const timeseries: DataFrame[] = [];
  for (const df of data) {
    if (df.refId == null) {
      continue;
    }
    if (isTimeseries(df)) {
      timeseries.push(df);
    } else if (isFeaturesTable(df)) {
      tables.push(df);
    } else if (isSimpleTimeseries(df)) {
      timeseries.push(timeFieldFirst(df));
    } else {
      console.warn('Unknown DataFrame');
    }
  }
  return {
    tables,
    timeseries,
  };
}

export type ParsedData = {
  features: Feature[];
  hasTableData: boolean;
};

export function parseData(data: DataFrame[]): ParsedData {
  const { tables, timeseries } = groupDataFrames(data);

  if (tables.length === 0 && timeseries.length > 0) {
    const singleTimeseries = loadSingleTimeseries(timeseries[0].fields, timeseries[0].refId as string);
    return {
      features: singleTimeseries ? [singleTimeseries] : [],
      hasTableData: false,
    };
  }

  const mappedFeatures = new MappedFeatures();
  for (const df of tables) {
    loadFeaturesByControl(df.fields, df.refId as string, mappedFeatures);
  }
  for (const df of timeseries) {
    loadTimeseries(df.fields, df.refId as string, mappedFeatures, df.meta);
  }

  const features = [...mappedFeatures.values()];

  return {
    features,
    hasTableData: tables.length > 0,
  };
}
