import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Collapse, Form, Input, InputNumber, Select, Upload, UploadFile, Image } from 'antd';

import MyEditor from "@/app/components/common/MyEditor";
import {ExpectedSchool, useLazyCheckSchoolEmailQuery, useSearchExpectedSchoolQuery} from '@/redux/services/schoolApi';
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
import EmailInput from '../common/EmailInput';
import DebounceSelect from '../common/DebounceSelect';
import {useLazySearchUsersQuery} from '@/redux/services/testApi';
import {ImageUpload} from '../common/ImageUploader';
import clsx from "clsx";
import {InboxOutlined} from "@ant-design/icons";
import {formatPhoneNumber} from "@/lib/phoneUtils";

const { Option } = Select;
const { Panel } = Collapse;

interface SchoolFieldType {
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
    actionButtons?: React.ReactNode;
    triggerCheckEmail?: any;
    schoolId?: number;
    isEdit?: boolean;
}

interface UserValue {
    label: string;
    value: string;
}

const SchoolForm: React.FC<SchoolFormFields> = ({
                                                    isReadOnly,
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
                                                    actionButtons,
                                                    triggerCheckEmail,
                                                    schoolId,
                                                    isEdit,
                                                }) => {
    const [form] = Form.useForm(externalForm);
    const emailInputRef = useRef<any>(null);
    const phoneInputRef = useRef<any>(null);


    const [triggerSearchUsers, searchUsersResult] = useLazySearchUsersQuery(); // Get the full tuple

    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);
    const [value, setValue] = useState<UserValue[]>([]);

    const [schoolOptions, setSchoolOptions] = useState<{ label: string; value: string }[]>([]);

    // Lazy load schools when component mounts
    const {data: schoolData, error, isLoading} = useSearchExpectedSchoolQuery();

    useEffect(() => {
        if (schoolData?.data) {
            setSchoolOptions(
                schoolData.data.map((expectedSchool: ExpectedSchool) => ({
                    label: expectedSchool.expectedSchool, // Display name in dropdown
                    value: expectedSchool.expectedSchool,
                }))
            );
        }
    }, [schoolData]);


    // Log imageList để kiểm tra dữ liệu
    useEffect(() => {
        console.log('imageList:', imageList);
    }, [imageList]);

    return (
        <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form<SchoolFieldType>
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
                            <Select
                                showSearch
                                placeholder="Search and select a school..."
                                options={schoolOptions}
                                filterOption={(input, option) =>
                                    !!(option && option.label.toLowerCase().includes(input.toLowerCase()))
                                }
                                disabled={isReadOnly}
                            />
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

                        <AddressInput
                            isReadOnly={isReadOnly}
                            form={form}
                        />

                        <EmailInput
                            form={form}
                            isReadOnly={isReadOnly}
                            ref={emailInputRef}
                            triggerCheckEmail={triggerCheckEmail}
                            schoolId={schoolId}
                        />
                        <PhoneInput
                            onPhoneChange={(phone) => form.setFieldsValue({phone})}
                            initialCountryCode={isEdit ? (externalForm.countryCode || '+84') : undefined}
                            form={form}
                            isReadOnly={isReadOnly}
                            ref={phoneInputRef}
                        />


                        <Form.Item
                            name="receivingAge"
                            label="Child receiving age"
                            rules={[{ required: true, message: 'Please select age range' }]}
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
                            rules={[{ required: true, message: 'Please select education method' }]}
                        >
                            <Select
                                placeholder="Select a category..."
                                options={EDUCATION_METHOD_OPTIONS}
                                className={isReadOnly ? "pointer-events-none" : ""}
                                suffixIcon={!isReadOnly}
                            />
                        </Form.Item>

                        <Form.Item label="Fee/Month (VND)" required className='mb-0'>
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
                                                form.setFieldsValue({ feeTo: value });
                                            }
                                            form.setFieldsValue({ feeFrom: value });
                                        }}
                                        readOnly={isReadOnly}
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
                                        onChange={(value) => form.setFieldsValue({ feeTo: value })}
                                        readOnly={isReadOnly}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>
                        <Form.Item
                            name="schoolOwners"
                            label="School Owners"
                            // rules={[{required: true, message: 'Please select a school owner'}]}
                        >
                            <DebounceSelect
                                mode='multiple'
                                queryResult={[triggerSearchUsers, searchUsersResult]}
                                placeholder="Search for a school owner..."
                                style={{width: '100%'}}
                                transformData={(response) =>
                                    response?.results?.map((user: any) => ({
                                        label: `${user.name.first} ${user.name.last}`,
                                        value: user.login.username,
                                    })) || []
                                }
                                onChange={(newValue) => form.setFieldsValue({schoolOwners: newValue})}
                            />
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
                                onChange={(value) => form.setFieldsValue({ description: value })}
                                isReadOnly={isReadOnly}
                            />
                        </Form.Item>
                        <Form.Item label="School image" name="image" valuePropName="fileList"
                                   getValueFromEvent={(e) => e?.fileList || []}>
                            <ImageUpload
                                form={form}
                                fieldName="image"
                                maxCount={10}
                                accept="image/*"
                                maxSizeMB={5}
                                hideImageUpload={hideImageUpload}
                                imageList={imageList}
                            />
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