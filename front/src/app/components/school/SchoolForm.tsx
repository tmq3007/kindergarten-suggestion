import React, { useEffect, useState } from 'react';
import { Checkbox, Form, Image, Input, InputNumber, Select, Upload, UploadFile } from 'antd';
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
import MyEditor from "@/app/components/common/MyEditor";
import { SchoolDTO, useAddSchoolMutation, useLazyCheckSchoolEmailQuery } from '@/redux/services/schoolApi';

const { Option } = Select;


interface FieldType {
    name: string;
    schoolType: number;
    website?: string;
    status: number;
    // Address Fields
    province: string;
    district: string;
    ward: string;
    street?: string;

    email: string;
    phone: string;

    receivingAge: number;
    educationMethod: number;

    // Fee Range
    feeFrom: number;
    feeTo: number;

    // Facilities and Utilities (Checkbox Groups)
    facilities?: number[];
    utilities?: number[];

    description?: string; // School introduction

    // File Upload
    image?: UploadFile[];
}

interface SchoolFormFields {
    form?: any;
    hasSaveDraftButton?: boolean;
    hasSubmitButton?: boolean;
}

const SchoolForm: React.FC<SchoolFormFields> = ({ form: externalForm, hasSaveDraftButton, hasSubmitButton }) => {
    const [form] = Form.useForm(externalForm);
    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    //Address states
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
    const [selectedWard, setSelectedWard] = useState<string | undefined>(undefined);
    //Email states
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);
    const [email, setEmail] = useState("");


    //Hooks
    //TODO: Change to School email validate
    const [triggerCheckEmail] = useLazyCheckSchoolEmailQuery();
    const [addSchool, { data: addSchoolData, isLoading: addSchoolIsLoading, error: addSchoolError }] = useAddSchoolMutation();
    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();
    const { data: provinces, isLoading: isLoadingProvince } = useGetProvincesQuery();
    const { data: districts, isLoading: isLoadingDistrict } = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince,
    });
    const { data: wards, isLoading: isLoadingWard } = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict,
    });


    //Event handlers
    // Set default country to VN 
    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === "VN");
            setSelectedCountry(defaultCountry);
        }
    }, [countries])

    // Handle country selection change
    const handleCountryChange = (value: string) => {
        if (countries) {
            const country = countries.find((c) => c.code === value);
            if (country) {
                setSelectedCountry(country);
            }
        }
    };
    // Handle phone number input change (remove non-numeric characters)
    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        e.target.value = value;  // Add sanitized value back to input
    };

    const onFinish = (values: FieldType) => {
        let formattedPhone = values.phone || "";

        // Format phone number if the country uses a trunk prefix and phone starts with "0"
        if (selectedCountry && !countriesKeepZero.includes(selectedCountry.dialCode) && formattedPhone.startsWith("0")) {
            formattedPhone = formattedPhone.substring(1);
        }

        // Combine dial code with the formatted phone number
        const fullPhoneNumber = selectedCountry ? `${selectedCountry.dialCode} ${formattedPhone}` : formattedPhone;

        // Convert UploadFile[] to File[]
        const fileList: File[] = (values.image || [])
            .filter((file) => file.originFileObj) // Ensure originFileObj exists
            .map((file) => file.originFileObj as File); // Extract native File object

        const finalValues: SchoolDTO = {
            ...values,
            image: fileList,
            phone: fullPhoneNumber
        };
        // Prevent form submission if email status is not "success"
        if (emailStatus !== 'success') {
            return;
        }
        addSchool(finalValues);
    };

    // Address event handler
    const onProvinceChange = (provinceCode: number) => {
        form.setFieldsValue({ district: undefined, ward: undefined, street: undefined }); // Reset dependent fields
        setSelectedProvince(provinceCode);
        setSelectedDistrict(undefined);
        setSelectedWard(undefined); // Reset ward when province changes
    };

    const onDistrictChange = (districtCode: number) => {
        form.setFieldsValue({ ward: undefined, street: undefined }); // Reset ward and street when district changes
        setSelectedDistrict(districtCode);
        setSelectedWard(undefined); // Reset ward when district changes
    };

    const onWardChange = (wardCode: number) => {
        setSelectedWard(wardCode.toString()); // Update ward when user selects
    };

    // Email event handler
    // Check if the email exists in the system
    const checkEmailExists = async () => {
        setEmailStatus("validating");
        setEmailHelp("Checking email availability...");

        try {
            const response = await triggerCheckEmail(email).unwrap();
            if (response.data === "true") {
                setEmailStatus("error");
                setEmailHelp("This email is already registered!");
            } else {
                setEmailStatus("success");
                setEmailHelp(null);
            }
        } catch (error) {
            setEmailStatus("error");
            setEmailHelp("Failed to validate email.");
        }
    };

    // Reset email status while typing
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailStatus(""); // Clear email status
        setEmailHelp(null);  // Clear email help text
    };

    // Validate email on blur
    const handleEmailBlur = async () => {
        if (!email) {
            setEmailStatus("error");
            setEmailHelp("Please input your email!");
            return;
        }
        if (email.length > 50) {
            setEmailStatus("error");
            setEmailHelp("Email cannot exceed 50 characters!");
            return;
        }

        // Check if the entered email matches a valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus("error");
            setEmailHelp("Please enter a valid email address!");
            return;
        }

        // Check email availability
        await checkEmailExists();
    };

    // Function to normalize the file list
    const normFile = (e: { fileList: UploadFile[] } | undefined): UploadFile[] => {
        return e?.fileList ?? []; // Ensure an array is returned
    };

    return (
        <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form<FieldType>
                size='middle'
                form={form}
                onFinish={onFinish}
                labelCol={{ span: 6, className: 'font-bold' }}
                labelAlign='left'
                labelWrap
                layout="horizontal"
                className="space-y-6 h-auto"
            >
                <div className='grid grid-cols-1  lg:grid-cols-2 lg:gap-16 '>
                    <div>
                        {/* School Name */}
                        <Form.Item

                            name="name"
                            label="School Name"
                            rules={[{ required: true, message: 'Please enter school name' }]}
                        >
                            <Input placeholder="Enter School Name here..." />
                        </Form.Item>

                        {/* School Type */}
                        <Form.Item

                            name="schoolType"
                            label="School Type"
                            rules={[{ required: true, message: 'Please select school type' }]}
                        >
                            <Select placeholder="Select a type..." options={SCHOOL_TYPES_OPTIONS}>
                            </Select>
                        </Form.Item>

                        {/* Address */}
                        <Form.Item label="Address" className='space-y-4' required>

                            {/* City, District, Province */}
                            <Form.Item
                                name="province"
                                className="mb-5"
                                rules={[{ required: true, message: 'Please select a province' }]}
                            >
                                <Select
                                    onChange={(districtName) => {
                                        const selectedProvince = provinces?.find(d => d.name === districtName);
                                        if (selectedProvince) {
                                            onProvinceChange(selectedProvince.code); // Pass code
                                        }
                                    }}
                                    placeholder="Select a province"
                                    loading={isLoadingProvince}
                                >
                                    {provinces?.map(province => (
                                        <Select.Option key={province.code} value={province.name}>
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
                                    onChange={(districtName) => {
                                        const selectedDistrict = districts?.find(d => d.name === districtName);
                                        if (selectedDistrict) {
                                            onDistrictChange(selectedDistrict.code); // Pass code
                                        }
                                    }}
                                    disabled={!selectedProvince}
                                >
                                    {districts?.map((district) => (
                                        <Option key={district.code} code={district.code} value={district.name}>
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
                                        const selectedWard = wards?.find(w => w.name === wardName);
                                        if (selectedWard) {
                                            onWardChange(selectedWard.code);
                                        }
                                    }}
                                    disabled={!selectedDistrict}
                                >
                                    {wards?.map((ward) => (
                                        <Option key={ward.code} code={ward.code} value={ward.name}>
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

                            name="email"
                            label="Email Address"
                            hasFeedback
                            validateTrigger="onFinish"
                            validateStatus={emailStatus}
                            help={emailHelp}
                            required={true}
                        >
                            <Input
                                placeholder="Enter your email"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                            />
                        </Form.Item>
                        {/* Phone Number */}
                        <Form.Item label="Phone Number"

                            required
                        >
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                {/* Country Code Selector */}
                                <Select
                                    loading={isLoadingCountry}
                                    value={selectedCountry?.code || ''}
                                    onChange={handleCountryChange}
                                    dropdownStyle={{ width: 250 }}
                                    style={{ width: 120, borderRight: "1px solid #ccc" }}
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
                                                    <Image src={country.flag}
                                                        alt={country.label}
                                                        width={20} height={14}
                                                        className="mr-2 intrinsic" preview={false} />
                                                    {country.code} {country.dialCode}
                                                </span>
                                            }
                                        >
                                            <div className="flex items-center">
                                                <Image src={country.flag}
                                                    alt={country.label}
                                                    width={20} height={14}
                                                    className="mr-2 intrinsic" />
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
                                    {/* Phone Input */}
                                    <Input
                                        placeholder="Enter your phone number"
                                        onChange={handlePhoneNumberChange}
                                        style={{ flex: 1, border: "none", boxShadow: "none" }}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>

                        {/* Child Receiving Age */}
                        <Form.Item
                            name="receivingAge"
                            label="Child receiving age"
                            rules={[{ required: true, message: 'Please select age range' }]}
                        >
                            <Select placeholder="Select a category..." options={CHILD_RECEIVING_AGES_OPTIONS}>
                            </Select>
                        </Form.Item>

                        {/* Education Method */}
                        <Form.Item

                            name="educationMethod"
                            label="Education method"
                            rules={[{ required: true, message: 'Please select education method' }]}
                        >
                            <Select placeholder="Select a category..." options={EDUCATION_METHODS_OPTIONS}>
                            </Select>
                        </Form.Item>

                        {/* Fee Month (From/To) */}
                        <div>
                            <Form.Item
                                className='mb-0'
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
                        {/* Website */}
                        <Form.Item
                            name="website"
                            label="School Website"
                        >
                            <Input placeholder="Enter School Website here..." />
                        </Form.Item>
                    </div>
                    <div>
                        <div>
                            {/* Facilities */}
                            <Form.Item label="Facilities" name="facilities">
                                <Checkbox.Group
                                    options={FACILITIES_OPTIONS}
                                    value={facilities}
                                    className="grid grid-cols-3 gap-2 custom-add-school-select"
                                />
                            </Form.Item>

                            {/* Utilities */}
                            <Form.Item label="Utilities" name="utilities">
                                <Checkbox.Group
                                    options={UTILITIES_OPTIONS}
                                    value={utilities}
                                    className="grid grid-cols-3 gap-2 custom-add-school-select"
                                />
                            </Form.Item>
                            <style>{`
                                .custom-add-school-select .ant-checkbox-wrapper {
                                    display: flex;
                                    align-items: center;
                                }

                                .custom-add-school-select .ant-checkbox-inner {
                                    width: 24px !important;
                                    height: 24px !important;
                                }

                                .custom-add-school-select .ant-checkbox-input {
                                    transform: scale(2);
                                }
                             `}</style>

                        </div>
                        {/* School Introduction */}
                        <div>
                            <Form.Item
                                name="description"
                                label="School introduction"
                            >
                                <MyEditor description={form.getFieldValue("description") || undefined} />
                            </Form.Item>
                        </div>
                        {/* School Image */}
                        <Form.Item
                            label="School image"
                        >
                            <Form.Item name="image" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                                <Upload.Dragger name="schoolImage"
                                    listType="picture"
                                    beforeUpload={() => false} // Prevent automatic upload
                                    maxCount={10}
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
                    </div>
                </div>
                {/* Submit Buttons */}
                <SchoolFormButton form={form} hasSaveDraftButton={hasSaveDraftButton} hasSubmitButton={hasSubmitButton} isAddSchoolLoading={addSchoolIsLoading} />
            </Form>
        </div>
    );
};

export default SchoolForm;