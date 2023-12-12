import { Field, FieldType } from '@grafana/data';
import { Dictionary, keyBy, omit } from 'lodash';
import { Feature } from './types';
import { dvGet } from './deprecatedVectorUtils';

type VectorField = Field<string, number[]>;
type ColumnsDict = {
  feature?: VectorField;
  control?: VectorField;
  nominal?: VectorField;
  partid?: VectorField;
  featuretype?: VectorField;
} & {
  [key: string]: VectorField;
};
type DataFrameRecord = {
  [key in keyof ColumnsDict]: any;
};

const metaColumns = ['feature', 'control', 'partid', 'featuretype'];

const defaultFeature = (key: string, partId: string, refId: string): Feature => ({
  uid: '',
  id: key,
  partId: partId,
  refId: refId,
  name: '',
  characteristics: {},
});

export class MappedFeatures extends Map<string, Feature> {
  getOrDefault = (record: DataFrameRecord, refId: string) => {
    const key = record.feature;
    if (this.has(key)) {
      return this.get(key) as Feature;
    }

    const newFeature = defaultFeature(key, record.partid?.toString() ?? '', refId);
    this.set(key, newFeature);
    return newFeature;
  };
}

function getRecord(columns: ColumnsDict, i: number) {
  return Object.keys(columns).reduce((acc, key) => {
    acc[key] = dvGet<number | string>(columns[key].values, i);
    return acc;
  }, {} as DataFrameRecord);
}

export function loadFeaturesByControl(
  fields: Array<Field<string, number[]>>,
  refId: string,
  mappedFeatures: MappedFeatures
) {
  const columns: ColumnsDict = keyBy(fields, (column) => column.name.toLowerCase());

  if (!columns.feature || !columns.control || !columns.nominal) {
    console.warn('alert-danger', [`Feature or Control or Nominal column is missing in query ${refId}.`]);
    return;
  }
  const length = columns.feature.values.length;
  //assert that fields.every(field => field.values.length === length) is true

  for (let i = 0; i < length; i++) {
    const record = getRecord(columns, i);
    const feature = mappedFeatures.getOrDefault(record, refId);

    if (!!record.control) {
      feature.characteristics[`${record.control}`] = {
        table: omit(record, metaColumns),
      };
    }
  }
}

function noNulls(timeVector: number[], valuesVector: number[]) {
  const t = [] as number[];
  const v = [] as number[];
  for (let i = 0; i < timeVector.length; i++) {
    const tVal = dvGet(timeVector, i);
    const vVal = dvGet(valuesVector, i);
    if (tVal != null && vVal != null) {
      t.push(tVal);
      v.push(vVal);
    }
  }
  return { t, v };
}

export function loadTimeseries(
  fields: Array<Field<string, number[]>>,
  refId: string,
  mappedFeatures: MappedFeatures,
  meta?: Dictionary<any>
) {
  const timeVector = fields?.[0];
  if (timeVector == null || timeVector.name !== 'Time') {
    console.warn('alert-danger', [`Timeseries data - missing Time vector in ${refId}.`]);
    return;
  }

  for (let i = 1; i < fields.length; i++) {
    const featureName = fields[i].labels?.feature;
    const controlName = fields[i].labels?.control;
    if (featureName == null || controlName == null) {
      continue;
    }
    const feature = mappedFeatures.get(featureName);
    if (feature == null) {
      continue;
    }
    const { t, v } = noNulls(timeVector.values as number[], fields[i].values as number[]);
    const timeseries = {
      time: { ...timeVector, values: t },
      values: { ...fields[i], values: v },
    };
    feature.characteristics[controlName] = {
      ...(feature.characteristics?.[controlName] ?? {}),
      timeseries,
    };
    if (meta != null && Object.keys(meta).length > 0) {
      feature.meta = { ...(feature.meta ?? {}), ...meta };
    }
  }
}

export function loadSingleTimeseries(fields: Array<Field<string, number[]>>, refId: string): Feature | undefined {
  const timeVector = fields?.[0];
  if (timeVector == null || timeVector.type !== FieldType.time) {
    console.warn('alert-danger', [`Timeseries data - missing Time vector in ${refId}.`]);
    return;
  }

  const firstValueField = () => {
    for (let i = 1; i < fields.length; i++) {
      if (fields[i].type === 'number') {
        return fields[i];
      }
    }
    return undefined;
  };

  const valueVector = firstValueField();
  if (valueVector == null) {
    console.warn('alert-danger', [`Timeseries data - missing Value vector in ${refId}.`]);
    return;
  }

  const newFeature = defaultFeature('value', '', refId);

  const { t, v } = noNulls(timeVector.values as number[], valueVector.values as number[]);
  const timeseries = {
    time: { ...timeVector, values: t },
    values: { ...valueVector, values: v },
  };
  newFeature.characteristics['timeseries'] = {
    table: {},
    timeseries,
  };

  return newFeature;
}
