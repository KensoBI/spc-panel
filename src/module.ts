import { PanelPlugin } from '@grafana/data';
import { PanelOptions, defaultPanelOptions } from './types';
import { ChartPanel } from './components/ChartPanel';
import { LimitsEditor } from './components/options/LimitsEditor';
import { ConstantsListEditor } from 'components/options/ConstrantsListEditor';
import { SimpleParamsEditor } from 'components/options/SimpleParamsEditor';
import { SpcOptionEditor } from 'components/options/SpcOptionEditor';

export const plugin = new PanelPlugin<PanelOptions>(ChartPanel).setPanelOptions((builder) => {
  builder.addCustomEditor({
    id: 'spcOptions',
    path: 'spcOptions',
    name: 'SPC options',
    description: 'Select options for SPC chart',
    defaultValue: defaultPanelOptions.spcOptions,
    editor: SpcOptionEditor,
    category: ['Chart'],
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
