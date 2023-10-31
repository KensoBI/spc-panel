import { PanelPlugin } from '@grafana/data';
import { PanelOptions, defaultPanelOptions } from './types';
import { ChartPanel } from './components/ChartPanel';
import { LimitsEditor } from './components/options/LimitsEditor';

export const plugin = new PanelPlugin<PanelOptions>(ChartPanel).setPanelOptions((builder) => {
  builder.addCustomEditor({
    id: 'limitConfig',
    path: 'limitConfig',
    name: 'Limits',
    description: 'Upper and lower limits for the chart',
    defaultValue: defaultPanelOptions.limitConfig,
    editor: LimitsEditor,
    category: ['Chart'],
  });

  return builder;
});
