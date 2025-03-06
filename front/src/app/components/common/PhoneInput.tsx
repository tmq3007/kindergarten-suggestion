import React, { useState } from 'react';
import { Form, Input, Select } from 'antd';
import { Country } from '@/redux/services/registerApi';
import { Image } from 'antd';

interface PhoneInputProps {
  countries: Country[] | undefined;
  isLoadingCountry: boolean;
  initialCountryCode?: string; // Optional initial country code
  onPhoneChange?: (phone: string) => void; // Callback to parent if needed
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countries,
  isLoadingCountry,
  initialCountryCode = 'VN',
  onPhoneChange,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(() => {
    return countries?.find((c) => c.code === initialCountryCode);
  });

  const handleCountryChange = (value: string) => {
    const country = countries?.find((c) => c.code === value);
    if (country) setSelectedCountry(country);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    if (onPhoneChange) onPhoneChange(value);
  };

  return (
    <Form.Item label="Phone Number" required>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <Select
          loading={isLoadingCountry}
          value={selectedCountry?.code || ''}
          onChange={handleCountryChange}
          dropdownStyle={{ width: 250 }}
          style={{ width: 120, borderRight: '1px solid #ccc' }}
          optionLabelProp="label2"
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {countries?.map((country) => (
            <Select.Option
              key={country.code}
              value={country.code}
              label={country.label}
              label2={
                <span className="flex items-center">
                  <Image
                    src={country.flag}
                    alt={country.label}
                    width={20}
                    height={14}
                    className="mr-2 intrinsic"
                    preview={false}
                  />
                  {country.code} {country.dialCode}
                </span>
              }
            >
              <div className="flex items-center">
                <Image
                  src={country.flag}
                  alt={country.label}
                  width={20}
                  height={14}
                  className="mr-2 intrinsic"
                />
                {country.dialCode} - {country.label}
              </div>
            </Select.Option>
          ))}
        </Select>
        <Form.Item
          name="phone"
          rules={[{ required: true, message: 'Please input your phone number!' }]}
          noStyle
        >
          <Input
            placeholder="Enter your phone number"
            onChange={handlePhoneNumberChange}
            style={{ flex: 1, border: 'none', boxShadow: 'none' }}
          />
        </Form.Item>
      </div>
    </Form.Item>
  );
};

export default PhoneInput;