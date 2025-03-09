import React, {useEffect, useState} from 'react';
import {Checkbox, Collapse, Form, Image, Input, InputNumber, Select, Upload, UploadFile} from 'antd';
import {InboxOutlined} from '@ant-design/icons';
import {Country, useGetCountriesQuery} from '@/redux/services/registerApi';
import {useGetDistrictsQuery, useGetProvincesQuery, useGetWardsQuery} from '@/redux/services/addressApi';

import MyEditor from "@/app/components/common/MyEditor";
import {useLazyCheckSchoolEmailQuery} from '@/redux/services/schoolApi';
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    FACILITY_OPTIONS,
    SCHOOL_TYPE_OPTIONS,
    UTILITY_OPTIONS
} from "@/lib/constants";
import SchoolFormButton from "@/app/components/school/SchoolFormButton";
import {handleDistrictChange, handleProvinceChange, handleWardChange} from "@/lib/addressUtils";

const {Option} = Select;
const {Panel} = Collapse;

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
    hasCancelButton?: boolean;
    hasSaveButton?: boolean;
    hasCreateSubmitButton?: boolean;
    hasUpdateSubmitButton?: boolean;
    hasDeleteButton?: boolean;
    hasEditButton?: boolean;
    hasRejectButton?: boolean;
    hasApproveButton?: boolean;
    hasPublishButton?: boolean;
    hasUnpublishButton?: boolean;
    hideImageUpload?: boolean;
    imageList?: { url: string; filename: string }[];
    actionButtons?: React.ReactNode; // Prop để truyền các nút hành động
}

const SchoolForm: React.FC<SchoolFormFields> = ({
                                                    form: externalForm,
                                                    hasCancelButton,
                                                    hasSaveButton,
                                                    hasCreateSubmitButton,
                                                    hasUpdateSubmitButton,
                                                    hasDeleteButton,
                                                    hasEditButton,
                                                    hasRejectButton,
                                                    hasApproveButton,
                                                    hasPublishButton,
                                                    hasUnpublishButton,
                                                    hideImageUpload = false,
                                                    imageList = [],
                                                    actionButtons, // Nhận các nút hành động
                                                }) => {
    const [form] = Form.useForm(externalForm);
    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    // Address states
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
    const [selectedWard, setSelectedWard] = useState<string | undefined>(undefined);
    // Email states
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);
    const [email, setEmail] = useState("");

    // Hooks
    const [triggerCheckEmail] = useLazyCheckSchoolEmailQuery();
    const {data: countries, isLoading: isLoadingCountry} = useGetCountriesQuery();
    const {data: provinces, isLoading: isLoadingProvince} = useGetProvincesQuery();
    const {data: districts, isLoading: isLoadingDistrict} = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince,
    });
    const {data: wards, isLoading: isLoadingWard} = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict,
    });

    // Event handlers
    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === "VN");
            setSelectedCountry(defaultCountry);
        }
    }, [countries]);

    const handleCountryChange = (value: string) => {
        if (countries) {
            const country = countries.find((c) => c.code === value);
            if (country) {
                setSelectedCountry(country);
            }
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = e.target.value.replace(/\D/g, "");
    };

    const onProvinceChange = (provinceCode: number) => {
        handleProvinceChange(provinceCode, form, setSelectedProvince, setSelectedDistrict, setSelectedWard);
    };

    const onDistrictChange = (districtCode: number) => {
        handleDistrictChange(districtCode, form, setSelectedDistrict, setSelectedWard);
    };

    const onWardChange = (wardCode: number) => {
        handleWardChange(wardCode.toString(), setSelectedWard);
    };

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

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailStatus("");
        setEmailHelp(null);
    };

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus("error");
            setEmailHelp("Please enter a valid email address!");
            return;
        }

        await checkEmailExists();
    };

    const normFile = (e: { fileList: UploadFile[] } | undefined): UploadFile[] => {
        return e?.fileList ?? [];
    };

    // Log imageList để kiểm tra dữ liệu
    useEffect(() => {
        console.log('imageList:', imageList);
    }, [imageList]);

    return (
        <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form<FieldType>
                size='middle'
                form={form}
                labelCol={{span: 6, className: 'font-bold'}}
                labelAlign='left'
                labelWrap
                layout="horizontal"
                className="space-y-6 h-auto"
            >
                <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
                    <div>
                        <Form.Item
                            name="name"
                            label="School Name"
                            rules={[{required: true, message: 'Please enter school name'}]}
                        >
                            <Input placeholder="Enter School Name here..."/>
                        </Form.Item>

                        <Form.Item
                            name="schoolType"
                            label="School Type"
                            rules={[{required: true, message: 'Please select school type'}]}
                        >
                            <Select placeholder="Select a type..." options={SCHOOL_TYPE_OPTIONS}/>
                        </Form.Item>

                        <Form.Item label="Address" className='space-y-4' required>
                            <Form.Item
                                name="province"
                                className="mb-5"
                                rules={[{required: true, message: 'Please select a province'}]}
                            >
                                <Select
                                    placeholder="Select a province"
                                    loading={isLoadingProvince}
                                    onChange={(districtName) => {
                                        const selectedProvince = provinces?.find(d => d.name === districtName);
                                        if (selectedProvince) {
                                            onProvinceChange(selectedProvince.code);
                                        }
                                    }}
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
                                rules={[{required: true, message: 'Please select a district'}]}
                            >
                                <Select
                                    loading={isLoadingDistrict}
                                    placeholder="Select district"
                                    onChange={(districtName) => {
                                        const selectedDistrict = districts?.find(d => d.name === districtName);
                                        if (selectedDistrict) {
                                            onDistrictChange(selectedDistrict.code);
                                        }
                                    }}
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
                                rules={[{required: true, message: 'Please select a ward'}]}
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
                                <Input placeholder="Enter School Address here..."/>
                            </Form.Item>
                        </Form.Item>

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

                        <Form.Item label="Phone Number" required>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <Select
                                    loading={isLoadingCountry}
                                    value={selectedCountry?.code || ''}
                                    onChange={handleCountryChange}
                                    dropdownStyle={{width: 250}}
                                    style={{width: 120, borderRight: "1px solid #ccc"}}
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
                                                    <Image src={country.flag} alt={country.label} width={20} height={14}
                                                           className="mr-2 intrinsic" preview={false}/>
                                                    {country.code} {country.dialCode}
                                                </span>
                                            }
                                        >
                                            <div className="flex items-center">
                                                <Image src={country.flag} alt={country.label} width={20} height={14}
                                                       className="mr-2 intrinsic"/>
                                                {country.dialCode} - {country.label}
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Form.Item
                                    name="phone"
                                    rules={[{required: true, message: 'Please input your phone number!'}]}
                                    noStyle
                                >
                                    <Input
                                        placeholder="Enter your phone number"
                                        onChange={handlePhoneNumberChange}
                                        style={{flex: 1, border: "none", boxShadow: "none"}}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="receivingAge"
                            label="Child receiving age"
                            rules={[{required: true, message: 'Please select age range'}]}
                        >
                            <Select placeholder="Select a category..." options={CHILD_RECEIVING_AGE_OPTIONS}/>
                        </Form.Item>

                        <Form.Item
                            name="educationMethod"
                            label="Education method"
                            rules={[{required: true, message: 'Please select education method'}]}
                        >
                            <Select placeholder="Select a category..." options={EDUCATION_METHOD_OPTIONS}/>
                        </Form.Item>

                        <Form.Item label="Fee/Month (VND)" required>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="feeFrom"
                                    label="From"
                                    rules={[{required: true, message: "Please select fee from"}]}
                                >
                                    <InputNumber
                                        placeholder="From"
                                        className="w-full"
                                        min={0}
                                        step={100000}
                                        onChange={(value) => {
                                            const feeTo = form.getFieldValue("feeTo");
                                            if (feeTo !== undefined && value !== null && value > feeTo) {
                                                form.setFieldsValue({feeTo: value});
                                            }
                                            form.setFieldsValue({feeFrom: value});
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="feeTo"
                                    label="To"
                                    dependencies={["feeFrom"]}
                                    rules={[
                                        {required: true, message: "Please select fee to"},
                                        ({getFieldValue}) => ({
                                            validator(_, value) {
                                                const feeFrom = getFieldValue("feeFrom");
                                                if (!value || feeFrom <= value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error("To amount must be greater than or equal to From amount"));
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="To"
                                        className="w-full"
                                        min={form.getFieldValue("feeFrom") || 0}
                                        step={100000}
                                        onChange={(value) => form.setFieldsValue({feeTo: value})}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="website"
                            label="School Website"
                        >
                            <Input placeholder="Enter School Website here..."/>
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item label="Facilities" name="facilities">
                            <Checkbox.Group
                                options={FACILITY_OPTIONS}
                                value={facilities}
                                className="grid grid-cols-3 gap-2 custom-add-school-select"
                            />
                        </Form.Item>

                        <Form.Item label="Utilities" name="utilities">
                            <Checkbox.Group
                                options={UTILITY_OPTIONS}
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

                        <Form.Item
                            name="description"
                            label="School introduction"
                        >
                            <MyEditor
                                description={form.getFieldValue("description") || undefined}
                                onChange={(value) => form.setFieldsValue({description: value})}
                            />
                        </Form.Item>

                        <Form.Item label="School image">
                            {imageList.length > 0 ? (
                                <Collapse defaultActiveKey={[]}
                                          style={{background: '#f5f5f5', borderRadius: '4px', marginBottom: '16px'}}>
                                    <Panel header={`View ${imageList.length} image${imageList.length > 1 ? 's' : ''}`}
                                           key="1">
                                        <div style={{maxHeight: '300px', overflowY: 'auto', padding: '8px'}}>
                                            {imageList.map((image, index) => (
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '8px 0',
                                                    borderBottom: '1px solid #f0f0f0'
                                                }}>
                                                    {image.url ? (
                                                        <Image
                                                            src={image.url}
                                                            alt={image.filename || `Image ${index + 1}`}
                                                            width={50}
                                                            height={50}
                                                            className="object-cover rounded-lg mr-2"
                                                            preview
                                                            onError={() => console.log(`Failed to load image: ${image.url}`)}
                                                        />
                                                    ) : (
                                                        <span style={{color: 'red', marginRight: '8px'}}>Image not available</span>
                                                    )}
                                                    <span>{image.filename || `Image ${index + 1}`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                </Collapse>
                            ) : !hideImageUpload ? (
                                <Form.Item name="image" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                                    <Upload.Dragger
                                        name="schoolImage"
                                        listType="picture"
                                        beforeUpload={() => false}
                                        maxCount={10}
                                        accept="image/*"
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined/>
                                        </p>
                                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                        <p className="ant-upload-text">Upload pictures of format
                                            <strong> jpg, jpeg, png</strong> only. Maximum size: <strong>5MB</strong>
                                        </p>
                                    </Upload.Dragger>
                                </Form.Item>
                            ) : (
                                <p>No images available</p>
                            )}
                        </Form.Item>
                    </div>
                </div>
                {/* Thêm Form.Item cho các nút ở đáy form */}
                <Form.Item style={{textAlign: 'center', marginTop: '16px'}}>
                    {actionButtons}
                </Form.Item>
                <SchoolFormButton
                    form={form}
                    hasCancelButton={hasCancelButton}
                    hasSaveButton={hasSaveButton}
                    hasCreateSubmitButton={hasCreateSubmitButton}
                    hasUpdateSubmitButton={hasUpdateSubmitButton}
                    hasDeleteButton={hasDeleteButton}
                    hasEditButton={hasEditButton}
                    hasRejectButton={hasRejectButton}
                    hasApproveButton={hasApproveButton}
                    hasPublishButton={hasPublishButton}
                    hasUnpublishButton={hasUnpublishButton}
                    selectedCountry={selectedCountry}
                />
            </Form>
        </div>
    );
};

export default SchoolForm;