import { DataFrame, FieldType } from '@grafana/data';
import { loadFeaturesByControl, loadSingleTimeseries, loadTimeseries, MappedFeatures } from './loadDataFrames';
import { Feature } from './types';

function isTimeseries(df: DataFrame) {
  return df.meta?.type === 'timeseries-wide' && df.fields?.[0]?.type === FieldType.time;
}

function hasColumn(df: DataFrame, name: string) {
  return df.fields.find((field) => field.name === name) != null;
}

function isFeaturesTable(df: DataFrame) {
  return hasColumn(df, 'feature') && hasColumn(df, 'control') && hasColumn(df, 'nominal');
}

function isCadTable(df: DataFrame) {
  return hasColumn(df, 'links') && hasColumn(df, 'colors');
}

function isScanTable(df: DataFrame) {
  return df.name === 'scans' && hasColumn(df, 'links') && hasColumn(df, 'times');
}

function groupDataFrames(data: DataFrame[]) {
  const tables: DataFrame[] = [];
  const timeseries: DataFrame[] = [];
  const cadFrames: DataFrame[] = [];
  const scanFrames: DataFrame[] = [];
  for (const df of data) {
    if (df.refId == null) {
      continue;
    }
    if (isTimeseries(df)) {
      timeseries.push(df);
    } else if (isFeaturesTable(df)) {
      tables.push(df);
    } else if (isCadTable(df)) {
      cadFrames.push(df);
    } else if (isScanTable(df)) {
      scanFrames.push(df);
    } else {
      console.warn('Unknown DataFrame');
    }
  }
  return {
    tables,
    timeseries,
    cadFrames,
    scanFrames,
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
