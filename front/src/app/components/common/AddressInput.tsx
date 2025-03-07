import React, { useState } from 'react';
import { Form, Select, Input } from 'antd';
import { useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery } from '@/redux/services/addressApi';

interface AddressInputProps {
  form: any; // Ant Design Form instance
  onAddressChange?: (address: { province?: string; district?: string; ward?: string; street?: string }) => void; // Optional callback to notify parent
}

const { Option } = Select;

const AddressInput: React.FC<AddressInputProps> = ({ form, onAddressChange }) => {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | undefined>();
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | undefined>();
  const [selectedWardCode, setSelectedWardCode] = useState<string | undefined>();

  // Fetch provinces
  const { data: provinces, isLoading: isLoadingProvince } = useGetProvincesQuery();

  // Fetch districts based on selected province
  const { data: districts, isLoading: isLoadingDistrict } = useGetDistrictsQuery(selectedProvinceCode!, {
    skip: !selectedProvinceCode, // Only fetch when province is selected
  });

  // Fetch wards based on selected district
  const { data: wards, isLoading: isLoadingWard } = useGetWardsQuery(selectedDistrictCode!, {
    skip: !selectedDistrictCode, // Only fetch when district is selected
  });

  // Handle province selection
  const onProvinceChange = (provinceName: string) => {
    const selected = provinces?.find((p) => p.name === provinceName);
    if (selected) {
      setSelectedProvinceCode(selected.code);
      setSelectedDistrictCode(undefined); // Reset district
      setSelectedWardCode(undefined); // Reset ward
      form.setFieldsValue({ district: undefined, ward: undefined, street: undefined }); // Reset dependent fields
      onAddressChange?.({ province: provinceName, district: undefined, ward: undefined, street: undefined });
    }
  };

  // Handle district selection
  const onDistrictChange = (districtName: string) => {
    const selected = districts?.find((d) => d.name === districtName);
    if (selected) {
      setSelectedDistrictCode(selected.code);
      setSelectedWardCode(undefined); // Reset ward
      form.setFieldsValue({ ward: undefined, street: undefined }); // Reset dependent fields
      onAddressChange?.({
        province: form.getFieldValue('province'),
        district: districtName,
        ward: undefined,
        street: undefined,
      });
    }
  };

  // Handle ward selection
  const onWardChange = (wardName: string) => {
    const selected = wards?.find((w) => w.name === wardName);
    if (selected) {
      setSelectedWardCode(selected.code.toString());
      onAddressChange?.({
        province: form.getFieldValue('province'),
        district: form.getFieldValue('district'),
        ward: wardName,
        street: form.getFieldValue('street'),
      });
    }
  };

  // Handle street input change
  const onStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const street = e.target.value;
    onAddressChange?.({
      province: form.getFieldValue('province'),
      district: form.getFieldValue('district'),
      ward: form.getFieldValue('ward'),
      street,
    });
  };

  return (
    <Form.Item label="Address" className="space-y-4" required>
      <Form.Item
        name="province"
        className="mb-5"
        rules={[{ required: true, message: 'Please select a province' }]}
      >
        <Select
          onChange={onProvinceChange}
          placeholder="Select a province"
          loading={isLoadingProvince}
        >
          {provinces?.map((province) => (
            <Option key={province.code} value={province.name}>
              {province.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="district"
        className="mb-5"
        rules={[{ required: true, message: 'Please select a district' }]}
      >
        <Select
          loading={isLoadingDistrict}
          placeholder="Select district"
          onChange={onDistrictChange}
          disabled={!selectedProvinceCode} // Disable until province is selected
        >
          {districts?.map((district) => (
            <Option key={district.code} value={district.name}>
              {district.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="ward"
        className="mb-5"
        rules={[{ required: true, message: 'Please select a ward' }]}
      >
        <Select
          loading={isLoadingWard}
          placeholder="Select ward"
          onChange={onWardChange}
          disabled={!selectedDistrictCode} // Disable until district is selected
        >
          {wards?.map((ward) => (
            <Option key={ward.code} value={ward.name}>
              {ward.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="street" className="mb-4">
        <Input placeholder="Enter School Address here..." onChange={onStreetChange} />
      </Form.Item>
    </Form.Item>
  );
};

export default AddressInput;