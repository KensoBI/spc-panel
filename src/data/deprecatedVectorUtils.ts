/* eslint-disable deprecation/deprecation */
import { ArrayVector } from '@grafana/data';

//dv - deprecated vector

export function dvGet<T = any>(values: ArrayVector<T> | T[], index: number) {
  if (values instanceof ArrayVector) {
    return values.get(index);
  }
  return values[index];
}

//copied from Grafana 10
if (!Object.getOwnPropertyDescriptor(Array.prototype, 'toArray')) {
  Object.defineProperties(Array.prototype, {
    get: {
      value: function (idx: number): any {
        return (this as any)[idx];
      },
      writable: true,
      enumerable: false,
      configurable: true,
    },
    set: {
      value: function (idx: number, value: any) {
        (this as any)[idx] = value;
      },
      writable: true,
      enumerable: false,
      configurable: true,
    },
    add: {
      value: function (value: any) {
        (this as any).push(value);
      },
      writable: true,
      enumerable: false,
      configurable: true,
    },
    toArray: {
      value: function () {
        return this;
      },
      writable: true,
      enumerable: false,
      configurable: true,
    },
  });
}
