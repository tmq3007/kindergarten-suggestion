import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Select } from 'antd';
import { Country, useGetCountriesQuery } from '@/redux/services/registerApi';
import { Image } from 'antd';
import countriesKeepZero from '@/lib/countriesKeepZero';

interface PhoneInputProps {
  initialCountryCode?: string;  //Optional initial Country
  onPhoneChange?: (phone: string) => void; // Optional callback to update form value
  triggerCheckPhone?: (phone: string) => any; // Optional hook for server-side validation
}

// Use forwardRef to allow parent to call methods
const PhoneInput = forwardRef(
  (
    {
      initialCountryCode = 'VN',
      onPhoneChange,
      triggerCheckPhone,
    }: PhoneInputProps,
    ref
  ) => {
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    const [phone, setPhone] = useState<string>('');
    const [phoneStatus, setPhoneStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [phoneHelp, setPhoneHelp] = useState<string | null>(null);

    // Fetch countries directly within PhoneInput
    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();

    // Sync selectedCountry with countries when they load
    useEffect(() => {
      if (countries && !selectedCountry) {
        const defaultCountry = countries.find((c) => c.code === initialCountryCode);
        setSelectedCountry(defaultCountry);
      }
    }, [countries, initialCountryCode]);

    const handleCountryChange = async (value: string) => {
      const country = countries?.find((c) => c.code === value);
      if (country) {
        setSelectedCountry(country);
        if (triggerCheckPhone) {
          await validatePhone();
        }
      }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
      setPhone(value);
      if (onPhoneChange) onPhoneChange(value);
      setPhoneStatus(''); // Reset status on change
      setPhoneHelp(null);
    };

    const validatePhone = async (): Promise<boolean> => {
      if (!phone) {
        setPhoneStatus('error');
        setPhoneHelp('Please input your phone number!');
        return false;
      }

      if (phone.length < 9 || phone.length > 15) {
        setPhoneStatus('error');
        setPhoneHelp('Phone number must be between 9 and 15 digits!');
        return false;
      }

      if (!selectedCountry) {
        setPhoneStatus('error');
        setPhoneHelp('Please select a country code!');
        return false;
      }

      const formattedPhone = getFormattedPhoneNumber();
      if (!triggerCheckPhone) {
        setPhoneStatus('success');
        setPhoneHelp(null);
        return true;
      }

      setPhoneStatus('validating');
      setPhoneHelp('Checking phone availability...');
      try {
        const response = await triggerCheckPhone(formattedPhone).unwrap();
        if (response.data === 'true') {
          setPhoneStatus('error');
          setPhoneHelp('This phone number is already registered!');
          return false;
        } else {
          setPhoneStatus('success');
          setPhoneHelp(null);
          return true;
        }
      } catch (error) {
        setPhoneStatus('error');
        setPhoneHelp('Failed to validate phone number.');
        return false;
      }
    };

    // Internal method to format the phone number
    const getFormattedPhoneNumber = (): string => {
      if (!selectedCountry || !phone) return phone;
      let formattedPhone = phone;
      if (!countriesKeepZero.includes(selectedCountry.dialCode) && formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      return `${selectedCountry.dialCode} ${formattedPhone}`;
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validatePhone,
      getFormattedPhoneNumber,
    }));

    const handlePhoneBlur = async () => {
      if (triggerCheckPhone) {
        await validatePhone();
      }
    };

    return (
      <div className="phone-input-container">
        <Form.Item
          label="Phone Number"
          required
          validateStatus={phoneStatus}
          help={phoneHelp}
        >
          <div className="flex items-center rounded-lg overflow-hidden">
            <Form.Item hasFeedback={!!triggerCheckPhone} noStyle >
              <Select
                style={{ width: 120 }}
                loading={isLoadingCountry}
                value={selectedCountry?.code}
                onChange={handleCountryChange}
                dropdownStyle={{ width: 250 }}
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
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[{ required: true, message: 'Please input your phone number!' }]}
              hasFeedback={!!triggerCheckPhone}
              validateStatus={phoneStatus}
              noStyle
            >
              <Input
                placeholder="Enter your phone number"
                value={phone}
                onChange={handlePhoneNumberChange}
                onBlur={triggerCheckPhone ? handlePhoneBlur : undefined}
                style={{ flex: 1 }}
              />
            </Form.Item>
            <style>{`
        .phone-input-container .ant-form-item-explain {
          color: red !important;
        }
        .phone-input-container .ant-form-item-has-error .ant-input {
          border-color: #ff4d4f !important;
        }
          .phone-input-container .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-right: none !important;
          }
          .phone-input-container .ant-input {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
          .phone-input-container .ant-input-affix-wrapper {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
      `}</style>
          </div>
        </Form.Item>
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;