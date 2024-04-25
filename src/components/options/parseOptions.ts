import React from 'react';
import { PanelOptions, SpcOptions } from 'types';
import { getTemplateSrv } from '@grafana/runtime';
import { VariableWithOptions } from '@grafana/data';

const SAMPLE_SIZE_VARIABLE = 'samplesize';

type WithIsVar<T> = { value: T; isVar: boolean };

function getSampleSize(spcOptions?: SpcOptions): WithIsVar<number> {
  const sampleSizeVarModel = getTemplateSrv()
    .getVariables()
    .find((v) => v.name.toLowerCase()  === SAMPLE_SIZE_VARIABLE) as VariableWithOptions | undefined;
  const sampleSizeVarStr = sampleSizeVarModel?.current?.value?.toString();
  const sampleSizeVar = sampleSizeVarStr != null ? parseInt(sampleSizeVarStr, 10) : undefined;

  const isVar = sampleSizeVar != null && !isNaN(sampleSizeVar);
  const sampleSize = isVar ? sampleSizeVar : spcOptions?.sampleSize ?? 1;
  return { value: sampleSize, isVar };
}

export function useParseSpcOptions(options?: SpcOptions): WithIsVar<SpcOptions> {
  const { value: sampleSize, isVar } = getSampleSize(options);
  return React.useMemo(
    () => ({
      value: {
        ...options,
        sampleSize,
      },
      isVar,
    }),
    [isVar, options, sampleSize]
  );
}

function useSearchParamsChange() {
  const [searchParams, setSearchParams] = React.useState(new URLSearchParams(window.location.search));

  React.useEffect(() => {
    const handleSearchParamsChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('pushstate', handleSearchParamsChange);
    return () => {
      window.removeEventListener('pushstate', handleSearchParamsChange);
    };
  }, []);

  return searchParams;
}

export function useParseOptions(options: PanelOptions): WithIsVar<PanelOptions> {
  const { value: sampleSize, isVar } = getSampleSize(options.spcOptions);
  const searchParams = useSearchParamsChange().get(`var-${SAMPLE_SIZE_VARIABLE}`);

  return React.useMemo(
    () => ({
      value: {
        ...options,
        spcOptions: {
          ...options.spcOptions,
          sampleSize,
        },
      },
      isVar,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVar, options, sampleSize, searchParams]
  );
}
