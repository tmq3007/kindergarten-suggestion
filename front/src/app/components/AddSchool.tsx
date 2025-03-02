import React, { useState } from 'react';
import { Form, Input, Select, Checkbox, Button, Upload, InputNumber } from 'antd';
import { InfoCircleOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { Country, useGetCountriesQuery } from '@/redux/services/registerApi';
import { useGetDistrictsQuery, useGetProvincesQuery, useGetWardsQuery } from '@/redux/services/addressApi';

const { Option } = Select;

const SchoolForm: React.FC = () => {
    const [form] = Form.useForm();
    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
    const [selectedWard, setSelectedWard] = useState<string | undefined>(undefined); // Thêm trạng thái theo dõi Ward

    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();
    const { data: provinces, isLoading: isLoadingProvince } = useGetProvincesQuery();
    const { data: districts, isLoading: isLoadingDistrict } = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince,
    });
    const { data: wards, isLoading: isLoadingWard } = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict,
    });

    const onFinish = (values: any) => {
        console.log('Form values:', values);
    };

    const handleFacilityChange = (checkedValues: string[]) => {
        setFacilities(checkedValues);
    };

    const handleUtilityChange = (checkedValues: string[]) => {
        setUtilities(checkedValues);
    };

    const onProvinceChange = (provinceCode: number) => {
        form.setFieldsValue({ district: undefined, ward: undefined, street: undefined }); // Reset các trường phụ thuộc
        setSelectedProvince(provinceCode);
        setSelectedDistrict(undefined);
        setSelectedWard(undefined); // Reset ward khi tỉnh thay đổi
    };

    const onDistrictChange = (districtCode: number) => {
        form.setFieldsValue({ ward: undefined, street: undefined }); // Reset ward và street khi quận thay đổi
        setSelectedDistrict(districtCode);
        setSelectedWard(undefined); // Reset ward khi quận thay đổi
    };

    const onWardChange = (wardCode: string) => {
        setSelectedWard(wardCode); // Cập nhật ward khi người dùng chọn
    };

    const facilityOptions = [
        'Outdoor playground',
        'Art room',
        'Musical room',
        'Swimming pool',
        'Cafeteria',
        'Library',
        'Montessori room',
        'Cameras',
    ];

    const utilityOptions = [
        'School bus',
        'Breakfast',
        'Afterschool care',
        'Health check',
        'Picnic activities',
        'E-Contact book',
        'Saturday class',
    ];

    return (
        <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Add new school</h2>
            <Form
                form={form}
                onFinish={onFinish}
                labelCol={{ span: 6, className: 'font-bold' }}
                labelAlign='left'
                labelWrap
                layout="horizontal"
                className="space-y-6 "
            >
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-16'>
                    <div>
                        {/* School Name */}
                        <Form.Item
                            tooltip="This is a required field"
                            name="schoolName"
                            label="School Name"
                            rules={[{ required: true, message: 'Please enter school name' }]}
                        >
                            <Input placeholder="Enter School Name here..." />
                        </Form.Item>

                        {/* School Type */}
                        <Form.Item
                            tooltip="This is a required field"
                            name="schoolType"
                            label="School Type"
                            rules={[{ required: true, message: 'Please select school type' }]}
                        >
                            <Select placeholder="Select a category...">
                                <Option value="public">Public</Option>
                                <Option value="private">Private</Option>
                                <Option value="charter">Charter</Option>
                            </Select>
                        </Form.Item>

                        {/* Address */}
                        <Form.Item label="Address" className='space-y-4' required tooltip="This is a required field">

                            {/* City, District, Province */}
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
                                    {provinces?.map(province => (
                                        <Select.Option key={province.code} value={province.code}>
                                            {province.name}
                                        </Select.Option>
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
                                    disabled={!selectedProvince}
                                >
                                    {districts?.map((district) => (
                                        <Option key={district.code} value={district.code}>
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
                                    onChange={onWardChange} // Cập nhật trạng thái ward khi thay đổi
                                    disabled={!selectedDistrict}
                                >
                                    {wards?.map((ward) => (
                                        <Option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="street"
                                className='mb-4'
                            >
                                <Input placeholder="Enter School Address here..." />
                            </Form.Item>
                        </Form.Item>
                        {/* Email and Phone */}
                        <Form.Item
                            tooltip="This is a required field"
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: 'Please enter email' }]}
                        >
                            <Input placeholder="Enter School Email here..." type="email" />
                        </Form.Item>
                        <Form.Item
                            tooltip="This is a required field"
                            name="phone"
                            label="Phone No."
                            rules={[{ required: true, message: 'Please enter phone number' }]}
                        >
                            <Input placeholder="Enter Phone Number here..." type="tel" />
                        </Form.Item>

                        {/* Child Receiving Age */}
                        <Form.Item
                            tooltip="This is a required field"
                            name="childAge"
                            label="Child receiving age"
                            rules={[{ required: true, message: 'Please select age range' }]}
                        >
                            <Select placeholder="Select a category...">
                                <Option value="3-5">3-5 years</Option>
                                <Option value="6-10">6-10 years</Option>
                                <Option value="11-14">11-14 years</Option>
                            </Select>
                        </Form.Item>

                        {/* Education Method */}
                        <Form.Item
                            tooltip="This is a required field"
                            name="educationMethod"
                            label="Education method"
                            rules={[{ required: true, message: 'Please select education method' }]}
                        >
                            <Select placeholder="Select a category...">
                                <Option value="traditional">Traditional</Option>
                                <Option value="montessori">Montessori</Option>
                                <Option value="online">Online</Option>
                            </Select>
                        </Form.Item>

                        {/* Fee Month (From/To) */}
                        <div>
                            <Form.Item
                                name="fee/month"
                                tooltip="This is a required field"
                                label="Fee/Month (VND)"
                                required
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item
                                        name="feeFrom"
                                        label="From"
                                        rules={[{ required: true, message: "Please select fee from" }]}
                                    >
                                        <InputNumber
                                            placeholder="From"
                                            className="w-full"
                                            min={0}
                                            step={100000}
                                            onChange={(value) => {
                                                const feeTo = form.getFieldValue("feeTo");
                                                if (feeTo !== undefined && value !== null && value > feeTo) {
                                                    form.setFieldsValue({ feeTo: value }); // Automatically set feeTo if feeFrom is greater
                                                }
                                                form.setFieldsValue({ feeFrom: value });
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="feeTo"
                                        label="To"
                                        dependencies={["feeFrom"]}
                                        rules={[
                                            { required: true, message: "Please select fee to" },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    const feeFrom = getFieldValue("feeFrom");
                                                    if (!value || feeFrom <= value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(
                                                        new Error("To amount must be greater than or equal to From amount")
                                                    );
                                                },
                                            }),
                                        ]}
                                    >
                                        <InputNumber
                                            placeholder="To"
                                            className="w-full"
                                            min={form.getFieldValue("feeFrom") || 0} // Ensure min value updates
                                            step={100000}
                                            onChange={(value) => form.setFieldsValue({ feeTo: value })}
                                        />
                                    </Form.Item>
                                </div>

                            </Form.Item>
                        </div>
                    </div>
                    <div>
                        {/* Facilities */}
                        <Form.Item label="Facilities" tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}>
                            <Checkbox.Group
                                options={facilityOptions}
                                onChange={handleFacilityChange}
                                value={facilities}
                            />
                        </Form.Item>

                        {/* Utilities */}
                        <Form.Item label="Utilities" tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}>
                            <Checkbox.Group
                                options={utilityOptions}
                                onChange={handleUtilityChange}
                                value={utilities}
                            />
                        </Form.Item>

                        {/* School Introduction */}
                        <Form.Item
                            tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}
                            name="schoolIntroduction"
                            label="School introduction"
                        >
                            <TextArea rows={4} placeholder="Enter text here..." />
                        </Form.Item>

                        {/* School Image */}
                        <Form.Item
                            tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}
                            name="schoolImage"
                            label="School image"
                        >
                            <Form.Item name="dragger" valuePropName="fileList" noStyle>
                                <Upload.Dragger name="schoolImage"
                                    listType="picture"
                                    beforeUpload={() => false} // Prevent automatic upload
                                    accept="image/*">
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                    <p className="ant-upload-text">Upload pictures of format
                                        <strong> jpg, jpeg, png</strong> only. Maximum size: <strong>5MB</strong>
                                    </p>

                                </Upload.Dragger>
                            </Form.Item>
                        </Form.Item>

                        {/* Submit Buttons */}

                    </div>
                </div>
                <div className="flex lg:justify-center space-x-4 justify-end">
                    <Button htmlType="button" onClick={() => form.resetFields()}>
                        Cancel
                    </Button>
                    <Button htmlType="button">
                        Save draft
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default SchoolForm;