import React from 'react';
import { Input } from '@grafana/ui';

type Props = {
  onChange: (value: number) => void;
  value: number | undefined;
  placeholder: string;
  width?: number;
};

export function InputFloat({ onChange, value, placeholder, width }: Props) {
  const [currentValue, setCurrentValue] = React.useState('');

  React.useEffect(() => {
    setCurrentValue(value?.toString() ?? '');
  }, [value]);
  return (
    <Input
      type={'number'}
      placeholder={placeholder}
      value={currentValue}
      onChange={(selected) => {
        const text = (selected?.target as HTMLInputElement)?.value ?? '';
        const numeric = parseFloat(text);
        setCurrentValue(text);
        onChange(numeric);
      }}
      width={width}
    />
  );
}
