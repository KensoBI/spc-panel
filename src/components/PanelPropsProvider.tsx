import React from 'react';
import { ChartPanelProps } from '../types';

const Context = React.createContext({} as ChartPanelProps);

export function usePanelProps() {
  return React.useContext(Context);
}

export function PanelPropsProvider({ children, panelProps }: React.PropsWithChildren<{ panelProps: ChartPanelProps }>) {
  return <Context.Provider value={panelProps}>{children}</Context.Provider>;
}
