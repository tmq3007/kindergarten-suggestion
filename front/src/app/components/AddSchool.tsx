import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Checkbox, Button, Upload, InputNumber, Image, UploadFile } from 'antd';
const { Option } = Select;
import { InfoCircleOutlined, InboxOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { Country, useGetCountriesQuery, useLazyCheckEmailQuery } from '@/redux/services/registerApi';
import { useGetDistrictsQuery, useGetProvincesQuery, useGetWardsQuery } from '@/redux/services/addressApi';
import countriesKeepZero from '@/lib/countriesKeepZero';
import { CHILD_RECEIVING_AGES_OPTIONS, EDUCATION_METHODS_OPTIONS, FACILITIES_OPTIONS, SCHOOL_TYPES_OPTIONS, UTILITIES_OPTIONS, } from '@/lib/constants';


interface FieldType {
    schoolName: string;
    schoolType: number;

    // Address Fields
    province: string;
    district: string;
    ward: string;
    street?: string;

    email: string;
    phone: string;
    countryCode: string;

    childAge: number;
    educationMethod: number;

    // Fee Range
    feeFrom: number;
    feeTo: number;

    // Facilities and Utilities (Checkbox Groups)
    facilities?: number[];
    utilities?: number[];

    description?: string; // School introduction

    // File Upload
    schoolImage?: File;
}


const SchoolForm: React.FC = () => {
    const [form] = Form.useForm();
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
    const [triggerCheckEmail, { isFetching }] = useLazyCheckEmailQuery();
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

        const finalValues = {
            ...values,
            phone: fullPhoneNumber
        };
        console.log('Form values:', finalValues);
    };

    const handleFacilityChange = (checkedValues: string[]) => {
        setFacilities(checkedValues);
    };

    const handleUtilityChange = (checkedValues: string[]) => {
        setUtilities(checkedValues);
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

    const onWardChange = (wardCode: string) => {
        setSelectedWard(wardCode); // Update ward when user selects
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
        console.log("Upload event:", e);
        return e?.fileList ?? []; // Ensure an array is returned
    };

    return (
        <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Add new school</h2>
            <Form<FieldType>
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
                            <Select placeholder="Select a type..." options={SCHOOL_TYPES_OPTIONS}>
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
                                    onChange={onDistrictChange}
                                    disabled={!selectedProvince}
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
                                    onChange={onWardChange} // Cập nhật trạng thái ward khi thay đổi
                                    disabled={!selectedDistrict}
                                >
                                    {wards?.map((ward) => (
                                        <Option key={ward.code} value={ward.name}>
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
                            label="Email Address"
                            hasFeedback
                            validateTrigger="onFinish"
                            validateStatus={emailStatus}
                            help={emailHelp}
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
                            tooltip="This is a required field"
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
                            tooltip="This is a required field"
                            name="childAge"
                            label="Child receiving age"
                            rules={[{ required: true, message: 'Please select age range' }]}
                        >
                            <Select placeholder="Select a category..." options={CHILD_RECEIVING_AGES_OPTIONS}>
                            </Select>
                        </Form.Item>

                        {/* Education Method */}
                        <Form.Item
                            tooltip="This is a required field"
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
                        <div>
                            {/* Facilities */}
                            <Form.Item label="Facilities" name="facilities" tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}>
                                <Checkbox.Group
                                    options={FACILITIES_OPTIONS}
                                    onChange={handleFacilityChange}
                                    value={facilities}
                                    className="grid grid-cols-3 gap-2 custom-add-school-select"
                                />
                            </Form.Item>

                            {/* Utilities */}
                            <Form.Item label="Utilities" name="utilities" tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}>
                                <Checkbox.Group
                                    options={UTILITIES_OPTIONS}
                                    onChange={handleUtilityChange}
                                    value={utilities}
                                    className="grid grid-cols-3 gap-2 custom-add-school-select"
                                />
                            </Form.Item>
                            <style>{`
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
                        <div >
                            <Form.Item
                                tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}
                                name="description"
                                label="School introduction"
                            >
                                <TextArea rows={4} placeholder="Enter text here..." className='h-32' allowClear />
                            </Form.Item>
                        </div>
                        {/* School Image */}
                        <Form.Item
                            tooltip={{ title: 'This is Optional', icon: <InfoCircleOutlined /> }}
                            label="School image"
                        >
                            <Form.Item name="image" valuePropName="file" noStyle>
                                <Upload.Dragger name="schoolImage"
                                    listType="picture"
                                    beforeUpload={() => false} // Prevent automatic upload
                                    maxCount={1}
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
                    <Button type="primary" htmlType="submit" >
                        Submit
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default SchoolForm;