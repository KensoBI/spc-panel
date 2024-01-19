import { DataFrame, FieldType } from '@grafana/data';
import {
  loadFeaturesByControl,
  loadSingleTimeseries,
  loadTimeseries,
  loadTimeseriesWithCustomData,
  MappedFeatures,
} from './loadDataFrames';
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
function isCustomTableVeriables(df: DataFrame) {
  return !(hasColumn(df, 'feature') && !hasColumn(df, 'control') && !hasColumn(df, 'nominal')) && df.fields.length > 0;
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
    } else if (isCustomTableVeriables(df)) {
      tables.push(df);
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
  hasCustomTableData: boolean;
};

type chartType = 'singleTimeseries' | 'notFeatureChart' | 'featureChart';

function guessChartType(tables: DataFrame[], timeseries: DataFrame[]): chartType {
  if (tables.length === 0 && timeseries.length > 0) {
    return 'singleTimeseries';
  }
  if (!tables[0]?.fields.some((field: { name: string }) => field.name === 'feature') && timeseries.length > 0) {
    return 'notFeatureChart';
  }
  return 'featureChart';
}

type ParseFunction = (tables: DataFrame[], timeseries: DataFrame[]) => ParsedData;

const parseSingleTimeseries: ParseFunction = (_, timeseries) => {
  const singleTimeseries = loadSingleTimeseries(timeseries[0].fields, timeseries[0].refId as string);
  return {
    features: singleTimeseries ? [singleTimeseries] : [],
    hasTableData: false,
    hasCustomTableData: false,
  };
};

const parseNotFeatureChart: ParseFunction = (tables, timeseries) => {
  const singleTimeseriesCustomTable = loadTimeseriesWithCustomData(
    timeseries[0].fields,
    timeseries[0].refId as string,
    tables[0].fields
  );
  return {
    features: singleTimeseriesCustomTable ? [singleTimeseriesCustomTable] : [],
    hasTableData: false,
    hasCustomTableData: tables.length > 0,
  };
};

const parseFeatureChart: ParseFunction = (tables, timeseries) => {
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
    hasCustomTableData: false,
  };
};

const parsers: Record<chartType, ParseFunction> = {
  singleTimeseries: parseSingleTimeseries,
  notFeatureChart: parseNotFeatureChart,
  featureChart: parseFeatureChart,
};

export function parseData(data: DataFrame[]): ParsedData {
  const { tables, timeseries } = groupDataFrames(data);

  const type = guessChartType(tables, timeseries);
  return parsers[type](tables, timeseries);
}
