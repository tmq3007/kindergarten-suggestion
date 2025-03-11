import React, {useEffect, useState} from 'react';
import {Checkbox, Collapse, Form, Image, Input, InputNumber, Select, Upload, UploadFile} from 'antd';
import {InboxOutlined} from '@ant-design/icons';
import {Country, useGetCountriesQuery} from '@/redux/services/registerApi';
import {useGetDistrictsQuery, useGetProvincesQuery, useGetWardsQuery} from '@/redux/services/addressApi';

import MyEditor from "@/app/components/common/MyEditor";
import { useLazyCheckSchoolEmailQuery } from '@/redux/services/schoolApi';
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    FACILITY_OPTIONS,
    SCHOOL_TYPE_OPTIONS,
    UTILITY_OPTIONS
} from "@/lib/constants";
import SchoolFormButton from "@/app/components/school/SchoolFormButton";
import PhoneInput from '../common/PhoneInput';
import AddressInput from '../common/AddressInput';
import { useRouter } from 'next/navigation';
import EmailInput from '../common/EmailInput';
import { ImageUpload } from '../common/ImageUploader';
import {handleDistrictChange, handleProvinceChange, handleWardChange} from "@/lib/addressUtils";
import clsx from "clsx";

const { Option } = Select;
const { Panel } = Collapse;

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
    isReadOnly?: boolean;
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
    const emailInputRef = useRef<any>(null);
    const phoneInputRef = useRef<any>(null);

    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);

    const [triggerCheckEmail] = useLazyCheckSchoolEmailQuery();

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
                labelCol={{ span: 6, className: 'font-bold' }}
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
                            rules={[{ required: true, message: 'Please enter school name' }]}
                        >
                            <Input placeholder="Enter School Name here..." readOnly={isReadOnly}/>
                        </Form.Item>

                        <Form.Item
                            name="schoolType"
                            label="School Type"
                            rules={[{required: true, message: 'Please select school type'}]}
                        >
                            <Select
                                placeholder="Select a type..."
                                options={SCHOOL_TYPE_OPTIONS}
                                className={isReadOnly ? "pointer-events-none" : ""}
                                suffixIcon={!isReadOnly}
                            />
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
                                    className={isReadOnly ? "pointer-events-none" : ""}
                                    suffixIcon={!isReadOnly}
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
                                    disabled={!isReadOnly && !selectedProvince}
                                    className={isReadOnly ? "pointer-events-none" : ""}
                                    suffixIcon={!isReadOnly}
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
                                    disabled={!isReadOnly && !selectedDistrict}
                                    className={isReadOnly ? "pointer-events-none" : ""}
                                    suffixIcon={!isReadOnly}
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
                                className={'read-only:'}
                                readOnly={isReadOnly}
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
                                    className={isReadOnly ? "pointer-events-none" : ""}
                                    suffixIcon={!isReadOnly}
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
                                        readOnly={isReadOnly}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="receivingAge"
                            label="Child receiving age"
                            rules={[{required: true, message: 'Please select age range'}]}
                        >
                            <Select
                                placeholder="Select a category..."
                                options={CHILD_RECEIVING_AGE_OPTIONS}
                                className={isReadOnly ? "pointer-events-none" : ""}
                                suffixIcon={!isReadOnly}
                            />
                        </Form.Item>

                        <Form.Item
                            name="educationMethod"
                            label="Education method"
                            rules={[{required: true, message: 'Please select education method'}]}
                        >
                            <Select
                                placeholder="Select a category..."
                                options={EDUCATION_METHOD_OPTIONS}
                                className={isReadOnly ? "pointer-events-none" : ""}
                                suffixIcon={!isReadOnly}
                            />
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
                                        readOnly={isReadOnly}
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
                                        readOnly={isReadOnly}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="website"
                            label="School Website"
                        >
                            <Input placeholder="Enter School Website here..." readOnly={isReadOnly}/>
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item label="Facilities" name="facilities">
                            <Checkbox.Group
                                options={FACILITY_OPTIONS}
                                value={facilities}
                                className={clsx(
                                    "grid grid-cols-3 gap-2 custom-add-school-select",
                                    { "pointer-events-none": isReadOnly }
                                )}
                            />
                        </Form.Item>

                        <Form.Item label="Utilities" name="utilities">
                            <Checkbox.Group
                                options={UTILITY_OPTIONS}
                                value={utilities}
                                className={clsx(
                                    "grid grid-cols-3 gap-2 custom-add-school-select",
                                    { "pointer-events-none": isReadOnly }
                                )}
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
                                isReadOnly={isReadOnly}
                            />
                        </Form.Item>
                        <Form.Item label="School image" name="image" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList || []}>
                            <ImageUpload form={form} fieldName="image" maxCount={10} accept="image/*" maxSizeMB={5} />
                        </Form.Item>
                    </div>
                </div>

                {/* Thêm Form.Item cho các nút ở đáy form */}
                <Form.Item style={{ textAlign: 'center', marginTop: '16px' }}>
                    {actionButtons}
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
                        emailInputRef={emailInputRef}
                        phoneInputRef={phoneInputRef}
                    />
                </Form.Item>

            </Form>
        </div>
    );
};

export default SchoolForm;