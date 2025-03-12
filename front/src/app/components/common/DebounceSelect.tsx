import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import debounce from 'lodash/debounce';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  queryResult: [(arg: string) => any, { isFetching: boolean; data?: any; error?: any }];
  debounceTimeout?: number;
  transformData: (data: any) => ValueType[];
}

function DebounceSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any
>({
  queryResult,
  debounceTimeout = 800,
  transformData,
  ...selectProps
}: DebounceSelectProps<ValueType>) {
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);
  const [trigger, { isFetching, data, error }] = queryResult;

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;

      try {
        const response = await trigger(value).unwrap();
        if (fetchId !== fetchRef.current) {
          return;
        }
        const transformedOptions = transformData(response);
        setOptions(transformedOptions);
      } catch (err) {
        setOptions([]);
      }
    };

    return debounce(loadOptions, debounceTimeout);
  }, [trigger, debounceTimeout, transformData]);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={isFetching ? <Spin size="small" /> : null}
      options={options}
      {...selectProps}
    />
  );
}

export default DebounceSelect;