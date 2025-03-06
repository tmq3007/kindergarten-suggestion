import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Form, Input, InputNumber, Select, Upload, UploadFile } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { Country, useGetCountriesQuery } from '@/redux/services/registerApi';
import { useGetDistrictsQuery, useGetProvincesQuery, useGetWardsQuery } from '@/redux/services/addressApi';
import countriesKeepZero from '@/lib/countriesKeepZero';
import {
    CHILD_RECEIVING_AGES_OPTIONS,
    EDUCATION_METHODS_OPTIONS,
    FACILITIES_OPTIONS,
    SCHOOL_TYPES_OPTIONS,
    UTILITIES_OPTIONS,
} from '@/lib/constants';
import SchoolFormButton from './SchoolFormButton';
import MyEditor from '@/app/components/common/MyEditor';
import { SchoolDTO, useAddSchoolMutation } from '@/redux/services/schoolApi';
import AddressInput from '../common/AddressInput';
import EmailInput from '../common/Emailinput';
import PhoneInput from '../common/PhoneInput';

interface FieldType {
    name: string;
    schoolType: number;
    website?: string;
    status: number;
    province: string;
    district: string;
    ward: string;
    street?: string;
    email: string;
    phone: string;
    receivingAge: number;
    educationMethod: number;
    feeFrom: number;
    feeTo: number;
    facilities?: number[];
    utilities?: number[];
    description?: string;
    image?: UploadFile[];
}

interface SchoolFormFields {
    form?: any;
    hasSaveDraftButton?: boolean;
    hasSubmitButton?: boolean;
}

const SchoolForm: React.FC<SchoolFormFields> = ({ form: externalForm, hasSaveDraftButton, hasSubmitButton }) => {
    const [form] = Form.useForm(externalForm);
    const emailInputRef = useRef<any>(null); // Ref to access EmailInput methods
    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>(); // Manage province selection
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>(); // Manage district selection

    const [addSchool, { isLoading: addSchoolIsLoading }] = useAddSchoolMutation();
    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();
    const { data: provinces, isLoading: isLoadingProvince } = useGetProvincesQuery();
    const { data: districts, isLoading: isLoadingDistrict } = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince, // Only fetch districts when province is selected
    });
    const { data: wards, isLoading: isLoadingWard } = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict, // Only fetch wards when district is selected
    });

    // Set default country to Vietnam on mount
    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === 'VN');
            setSelectedCountry(defaultCountry);
        }
    }, [countries]);

    // Handle form submission
    const onFinish = async (values: FieldType) => {
        // Trigger email validation if it hasn't been validated yet
        const isEmailValid = await emailInputRef.current?.validateEmail();
        if (!isEmailValid || emailStatus !== 'success') {
          console.log('Email validation failed or emailStatus is not success:', emailStatus);
          return; // Stop submission if email validation fails
        }
    
        let formattedPhone = values.phone || '';
        if (selectedCountry && !countriesKeepZero.includes(selectedCountry.dialCode) && formattedPhone.startsWith('0')) {
          formattedPhone = formattedPhone.substring(1);
        }
        const fullPhoneNumber = selectedCountry ? `${selectedCountry.dialCode} ${formattedPhone}` : formattedPhone;
        const fileList: File[] = (values.image || [])
          .filter((file) => file.originFileObj)
          .map((file) => file.originFileObj as File);
    
        const finalValues: SchoolDTO = {
          ...values,
          image: fileList,
          phone: fullPhoneNumber,
        };
        console.log('Form submitted with values:', finalValues);
        // addSchool(finalValues); // Uncomment when ready
      };

    // Handle province change from AddressInput
    const handleProvinceChange = (provinceCode: number) => {
        setSelectedProvince(provinceCode); // Update state to trigger districts query
    };

    // Handle district change from AddressInput
    const handleDistrictChange = (districtCode: number) => {
        setSelectedDistrict(districtCode); // Update state to trigger wards query
    };

    const normFile = (e: { fileList: UploadFile[] } | undefined): UploadFile[] => e?.fileList ?? [];

    return (
        <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form<FieldType>
                size="middle"
                form={form}
                onFinish={onFinish}
                labelCol={{ span: 6, className: 'font-bold' }}
                labelAlign="left"
                labelWrap
                layout="horizontal"
                className="space-y-6 h-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <Form.Item name="name" label="School Name" rules={[{ required: true, message: 'Please enter school name' }]}>
                            <Input placeholder="Enter School Name here..." />
                        </Form.Item>
                        <Form.Item
                            name="schoolType"
                            label="School Type"
                            rules={[{ required: true, message: 'Please select school type' }]}
                        >
                            <Select placeholder="Select a type..." options={SCHOOL_TYPES_OPTIONS} />
                        </Form.Item>
                        <AddressInput
                            provinces={provinces}
                            districts={districts}
                            wards={wards}
                            isLoadingProvince={isLoadingProvince}
                            isLoadingDistrict={isLoadingDistrict}
                            isLoadingWard={isLoadingWard}
                            form={form}
                            onProvinceChange={handleProvinceChange} // Pass handler to update selectedProvince
                            onDistrictChange={handleDistrictChange} // Pass handler to update selectedDistrict
                        />
                        <EmailInput
                            onEmailStatusChange={(status, help) => {
                                setEmailStatus(status);
                                setEmailHelp(help);
                            }}
                        />
                        <PhoneInput
                            countries={countries}
                            isLoadingCountry={isLoadingCountry}
                            onPhoneChange={(phone) => form.setFieldsValue({ phone })}
                        />
                        <Form.Item
                            name="receivingAge"
                            label="Child receiving age"
                            rules={[{ required: true, message: 'Please select age range' }]}
                        >
                            <Select placeholder="Select a category..." options={CHILD_RECEIVING_AGES_OPTIONS} />
                        </Form.Item>
                        <Form.Item
                            name="educationMethod"
                            label="Education method"
                            rules={[{ required: true, message: 'Please select education method' }]}
                        >
                            <Select placeholder="Select a category..." options={EDUCATION_METHODS_OPTIONS} />
                        </Form.Item>
                        <Form.Item className="mb-0" label="Fee/Month (VND)" required>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="feeFrom"
                                    label="From"
                                    rules={[{ required: true, message: 'Please select fee from' }]}
                                >
                                    <InputNumber
                                        placeholder="From"
                                        className="w-full"
                                        min={0}
                                        step={100000}
                                        onChange={(value) => {
                                            const feeTo = form.getFieldValue('feeTo');
                                            if (feeTo !== undefined && value !== null && value > feeTo) {
                                                form.setFieldsValue({ feeTo: value });
                                            }
                                            form.setFieldsValue({ feeFrom: value });
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="feeTo"
                                    label="To"
                                    dependencies={['feeFrom']}
                                    rules={[
                                        { required: true, message: 'Please select fee to' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const feeFrom = getFieldValue('feeFrom');
                                                if (!value || feeFrom <= value) return Promise.resolve();
                                                return Promise.reject(new Error('To amount must be greater than or equal to From amount'));
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="To"
                                        className="w-full"
                                        min={form.getFieldValue('feeFrom') || 0}
                                        step={100000}
                                        onChange={(value) => form.setFieldsValue({ feeTo: value })}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>
                        <Form.Item name="website" label="School Website">
                            <Input placeholder="Enter School Website here..." />
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item label="Facilities" name="facilities">
                            <Checkbox.Group
                                options={FACILITIES_OPTIONS}
                                value={facilities}
                                className="grid grid-cols-3 gap-2 custom-add-school-select"
                            />
                        </Form.Item>
                        <Form.Item label="Utilities" name="utilities">
                            <Checkbox.Group
                                options={UTILITIES_OPTIONS}
                                value={utilities}
                                className="grid grid-cols-3 gap-2 custom-add-school-select"
                            />
                        </Form.Item>
                        <Form.Item name="description" label="School introduction">
                            <MyEditor description={form.getFieldValue('description') || undefined} />
                        </Form.Item>
                        <Form.Item label="School image">
                            <Form.Item name="image" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                                <Upload.Dragger
                                    name="schoolImage"
                                    listType="picture"
                                    beforeUpload={() => false}
                                    maxCount={10}
                                    accept="image/*"
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                    <p className="ant-upload-text">
                                        Upload pictures of format <strong>jpg, jpeg, png</strong> only. Maximum size: <strong>5MB</strong>
                                    </p>
                                </Upload.Dragger>
                            </Form.Item>
                        </Form.Item>
                    </div>
                </div>
                <SchoolFormButton
                    form={form}
                    hasSaveDraftButton={hasSaveDraftButton}
                    hasSubmitButton={hasSubmitButton}
                    isAddSchoolLoading={addSchoolIsLoading}
                />
            </Form>
        </div>
    );
};

export default SchoolForm;