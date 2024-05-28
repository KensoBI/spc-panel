import { PanelPlugin, standardEditorsRegistry } from '@grafana/data';
import { PanelOptions, defaultPanelOptions } from './types';
import { ChartPanel } from './components/ChartPanel';
import { LimitsEditor } from './components/options/LimitsEditor';
import { ConstantsListEditor } from 'components/options/ConstantsListEditor';
import { SimpleParamsEditor } from 'components/options/SimpleParamsEditor';
import { SpcOptionEditor } from 'components/options/SpcOptionEditor';
import { parseData } from 'data/parseData';

export const plugin = new PanelPlugin<PanelOptions>(ChartPanel).setPanelOptions((builder) => {
  builder.addCustomEditor({
    id: 'timeseriesParams.displayName',
    path: 'timeseriesParams.displayName',
    name: 'Display name',
    description: 'Change the field or series name',
    editor: standardEditorsRegistry.get('text').editor as any,
    category: ['Standard options'],
    settings: {
      placeholder: 'none',
      expandTemplateVars: true,
    },
  });
  builder.addCustomEditor({
    id: 'timeseriesParams.min',
    path: 'timeseriesParams.min',
    name: 'Min',
    description: 'Leave empty to calculate based on all values',
    editor: standardEditorsRegistry.get('number').editor as any,
    category: ['Standard options'],
    settings: {
      placeholder: 'auto',
    },
  });
  builder.addCustomEditor({
    id: 'timeseriesParams.max',
    path: 'timeseriesParams.max',
    name: 'Max',
    description: 'Leave empty to calculate based on all values',
    editor: standardEditorsRegistry.get('number').editor as any,
    category: ['Standard options'],
    settings: {
      placeholder: 'auto',
    },
  });
  builder.addCustomEditor({
    id: 'timeseriesParams.decimals',
    path: 'timeseriesParams.decimals',
    name: 'Decimals',
    editor: standardEditorsRegistry.get('number').editor as any,
    category: ['Standard options'],
    settings: {
      placeholder: 'auto',
      min: 0,
      max: 10,
      integer: true,
    },
  });
  builder.addCustomEditor({
    id: 'spcOptions',
    path: 'spcOptions',
    name: 'SPC options',
    description: 'Select options for SPC chart. You can enter a custom sample size value by typing a number.',
    defaultValue: defaultPanelOptions.spcOptions,
    editor: SpcOptionEditor,
    category: ['Chart'],
    showIf: (_, data) => parseData(data ?? []).hasTableData === false,
  });
  builder.addCustomEditor({
    id: 'constantsConfig',
    path: 'constantsConfig',
    name: 'Constants',
    description: 'Add constants for the chart',
    defaultValue: defaultPanelOptions.constantsConfig,
    editor: ConstantsListEditor,
    category: ['Chart'],
  });
  builder.addCustomEditor({
    id: 'limitConfig',
    path: 'limitConfig',
    name: 'Limits',
    description: 'Upper and lower limits for the chart',
    defaultValue: defaultPanelOptions.limitConfig,
    editor: LimitsEditor,
    category: ['Chart'],
  });
  builder.addCustomEditor({
    id: 'timeseriesParams',
    path: 'timeseriesParams',
    name: 'Options',
    description: 'Timeseries settings',
    defaultValue: defaultPanelOptions.timeseriesParams,
    editor: SimpleParamsEditor,
    category: ['Chart'],
  });

  return builder;
});
