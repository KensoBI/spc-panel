import { Field } from '@grafana/data';

export type Characteristic = {
  table: {
    [field: string]: any;
  };
  timeseries?: {
    time: Field<string, number[]>;
    values: Field<string, number[]>;
  };
};

export type Feature = {
  uid: string;
  id: string;
  partId: string;
  refId: string;
  name: string;
  meta?: {
    calculationType?: string;
    [key: string]: any;
  };
  characteristics: {
    [characteristic: string]: Characteristic;
  };
};
