import { PanelOptions } from 'types';
import { getTemplateSrv } from '@grafana/runtime';
import { VariableWithOptions } from '@grafana/data';

const SAMPLE_SIZE_VARIABLE = 'sampleSize';

export function parseOptions(options: PanelOptions): PanelOptions {
  const sampleSizeVarModel = getTemplateSrv()
    .getVariables()
    .find((v) => v.name === SAMPLE_SIZE_VARIABLE) as VariableWithOptions | undefined;
  const sampleSizeVarStr = sampleSizeVarModel?.current?.value?.toString();
  const sampleSizeVar = sampleSizeVarStr != null ? parseInt(sampleSizeVarStr, 10) : undefined;
  const sampleSize =
    sampleSizeVar != null && !isNaN(sampleSizeVar) ? sampleSizeVar : options.spcOptions?.sampleSize ?? 1;

  return {
    ...options,
    spcOptions: {
      ...options.spcOptions,
      sampleSize,
    },
  };
}
