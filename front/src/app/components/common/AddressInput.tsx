import React, { useState } from 'react';
import { Form, Select, Input } from 'antd';
import { Province, District, Ward } from '@/redux/services/addressApi';

interface AddressInputProps {
  provinces: Province[] | undefined;
  districts: District[] | undefined;
  wards: Ward[] | undefined;
  isLoadingProvince: boolean;
  isLoadingDistrict: boolean;
  isLoadingWard: boolean;
  form: any;
  onProvinceChange: (provinceCode: number) => void; // Added to notify parent
  onDistrictChange: (districtCode: number) => void; // Added to notify parent
}

const { Option } = Select;

const AddressInput: React.FC<AddressInputProps> = ({
  provinces,
  districts,
  wards,
  isLoadingProvince,
  isLoadingDistrict,
  isLoadingWard,
  form,
  onProvinceChange: onProvinceChangeParent, // Renamed to avoid conflict
  onDistrictChange: onDistrictChangeParent, // Renamed to avoid conflict
}) => {
  const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
  const [selectedWard, setSelectedWard] = useState<string | undefined>();

  // Handle province selection and notify parent to fetch districts
  const onProvinceChange = (provinceCode: number) => {
    form.setFieldsValue({ district: undefined, ward: undefined, street: undefined }); // Reset dependent fields
    setSelectedProvince(provinceCode);
    setSelectedDistrict(undefined); // Clear district
    setSelectedWard(undefined); // Clear ward
    onProvinceChangeParent(provinceCode); // Notify parent to update districts query
  };

  // Handle district selection and notify parent to fetch wards
  const onDistrictChange = (districtCode: number) => {
    form.setFieldsValue({ ward: undefined, street: undefined }); // Reset ward and street
    setSelectedDistrict(districtCode);
    setSelectedWard(undefined); // Clear ward
    onDistrictChangeParent(districtCode); // Notify parent to update wards query
  };

  // Handle ward selection
  const onWardChange = (wardCode: number) => {
    setSelectedWard(wardCode.toString());
  };

  return (
    <Form.Item label="Address" className="space-y-4" required>
      <Form.Item
        name="province"
        className="mb-5"
        rules={[{ required: true, message: 'Please select a province' }]}
      >
        <Select
          onChange={(provinceName) => {
            const selected = provinces?.find((p) => p.name === provinceName);
            if (selected) onProvinceChange(selected.code);
          }}
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
          onChange={(districtName) => {
            const selected = districts?.find((d) => d.name === districtName);
            if (selected) onDistrictChange(selected.code);
          }}
          disabled={!selectedProvince} // Disable until province is selected
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
          onChange={(wardName) => {
            const selected = wards?.find((w) => w.name === wardName);
            if (selected) onWardChange(selected.code);
          }}
          disabled={!selectedDistrict} // Disable until district is selected
        >
          {wards?.map((ward) => (
            <Option key={ward.code} value={ward.name}>
              {ward.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="street" className="mb-4">
        <Input placeholder="Enter School Address here..." />
      </Form.Item>
    </Form.Item>
  );
};

export default AddressInput;