import React from 'react';
import { ChartPanelProps } from 'types';
import { css, cx } from '@emotion/css';
import { usePanelContext, useStyles2 } from '@grafana/ui';
import { parseData } from 'data/parseData';
import { PanelPropsProvider } from './PanelPropsProvider';
import { TimeSeriesComponent } from './SpcChart/TimeSeriesComponent';
import { TimeseriesSettings, defaultTimeseriesSettings } from './SpcChart/types';
import { calcSpc } from 'data/calcSpc';
import { useParseOptions } from './options/parseOptions';

export function ChartPanel(props: ChartPanelProps) {
  const { data, width, height } = props;
  const styles = useStyles2(getStyles);
  const { value: options } = useParseOptions(props.options);

  const { features, hasTableData, hasCustomTableData } = React.useMemo(() => parseData(data.series), [data.series]);

  const [selectedFeature, selectedCharacteristic] = React.useMemo(() => {
    if (features.length === 0) {
      return [null, null];
    }
    let selectedFeature = features[0];
    if (!hasTableData) {
      selectedFeature = calcSpc(selectedFeature, options.spcOptions, options.constantsConfig);
    }
    const keys = Object.keys(selectedFeature.characteristics);
    if (keys.length === 0) {
      return [null, null];
    }
    const selectedCharacteristic = selectedFeature.characteristics[keys[0]];
    return [selectedFeature, selectedCharacteristic];
  }, [features, hasTableData, options.constantsConfig, options.spcOptions]);

  const context = usePanelContext();
  const onInstanceStateChange = context.onInstanceStateChange;
  React.useEffect(() => {
    onInstanceStateChange?.({
      characteristicKeys: selectedCharacteristic?.table ? Object.keys(selectedCharacteristic.table) : null,
      hasTableData,
      hasCustomTableData,
    });
  }, [hasTableData, onInstanceStateChange, selectedCharacteristic, selectedFeature, hasCustomTableData]);

  const settings: TimeseriesSettings = React.useMemo(() => {
    const settings = { ...defaultTimeseriesSettings, ...options.timeseriesParams, ...options.spcOptions };
    settings.constantsConfig = {
      items: [],
    };
    if (options?.limitConfig) {
      settings.limitConfig = options.limitConfig;
      if (options.limitConfig.up) {
        settings.constantsConfig.items.push({
          name: options.limitConfig.up.name,
          title: options.limitConfig.up.name,
          color: options.limitConfig.up.color,
          lineWidth: 2,
        });
      }

      if (options.limitConfig.down) {
        settings.constantsConfig.items.push({
          name: options.limitConfig.down.name,
          title: options.limitConfig.down.name,
          color: options.limitConfig.down.color,
          lineWidth: 2,
        });
      }
    }
    if (options?.constantsConfig && options.constantsConfig.items.length > 0) {
      settings.constantsConfig.items.push(...options.constantsConfig.items);
    }
    return settings;
  }, [options]);

  const updatedProps = React.useMemo(
    () => ({
      ...props,
      options,
    }),
    [options, props]
  );

  return (
    <PanelPropsProvider panelProps={updatedProps}>
      <div
        className={cx(
          styles.wrapper,
          css`
            width: ${width}px;
            height: ${height}px;
          `
        )}
      >
        {selectedFeature && selectedCharacteristic && (
          <TimeSeriesComponent feature={selectedFeature} characteristic={selectedCharacteristic} settings={settings} />
        )}
      </div>
    </PanelPropsProvider>
  );
}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};
