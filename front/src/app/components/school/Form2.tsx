import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Form, GetProp, Input, InputNumber, notification, Select, Upload, UploadFile, UploadProps } from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import {
    CHILD_RECEIVING_AGES_OPTIONS,
    EDUCATION_METHODS_OPTIONS,
    FACILITIES_OPTIONS,
    SCHOOL_TYPES_OPTIONS,
    UTILITIES_OPTIONS,
} from '@/lib/constants';
import SchoolFormButton from './SchoolFormButton';
import MyEditor from '@/app/components/common/MyEditor';
import { SchoolDTO, useAddSchoolMutation, useLazyCheckSchoolPhoneQuery, useLazyCheckSchoolEmailQuery } from '@/redux/services/schoolApi';
import AddressInput from '../common/AddressInput';
import EmailInput from '../common/Emailinput';
import PhoneInput from '../common/PhoneInput';
import { ImageUpload } from '../common/ImageUploader';
import { useRouter } from 'next/navigation';

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
    const emailInputRef = useRef<any>(null);
    const phoneInputRef = useRef<any>(null);
    const router = useRouter();
    const [api, contextHolder] = notification.useNotification();

    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);

    const [triggerCheckEmail] = useLazyCheckSchoolEmailQuery();
    const [triggerCheckPhone] = useLazyCheckSchoolPhoneQuery();
    const [addSchool, { isLoading: addSchoolIsLoading, data: addSchoolData, error: addSchoolError }] = useAddSchoolMutation();
    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string | React.ReactNode,duration: number) => {
        api[type]({
            message,
            description,
            duration: duration,
            placement: 'topRight',
            showProgress: true,
            pauseOnHover: false
        });
    };

    useEffect(() => {
        if (addSchoolData) {
            form.resetFields();
            openNotificationWithIcon(
                'success',
                'School Added Successfully',
                'The school has been added to the system successfully.',
                2
            );
            router.push("/admin/management/school/school-list")
        }
        if (addSchoolError) {
            let errorMessage: string | React.ReactNode = 'There was an error while adding the school. Please try again.';
            if (addSchoolError && 'data' in addSchoolError) {
                const errorData = (addSchoolError as {
                    data?: {
                        message?: string;
                        fieldErrors?: { message: string }[];
                        globalErrors?: { message: string }[];
                    }
                }).data;

                const allErrorMessages: string[] = [];

                if (errorData?.fieldErrors && errorData.fieldErrors.length > 0) {
                    allErrorMessages.push(...errorData.fieldErrors.map(err => err.message));
                }

                if (errorData?.globalErrors && errorData.globalErrors.length > 0) {
                    allErrorMessages.push(...errorData.globalErrors.map(err => err.message));
                }

                if (allErrorMessages.length > 0) {
                    errorMessage = allErrorMessages.map((msg, index) => (
                        <React.Fragment key={index}>
                            {'-' + msg}
                            {index < allErrorMessages.length - 1 && <br />}
                        </React.Fragment>
                    ));
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }
            } else if (addSchoolError && 'message' in addSchoolError) {
                errorMessage = (addSchoolError as { message?: string }).message || errorMessage;
            }

            openNotificationWithIcon(
                'error',
                'Failed to Add School',
                errorMessage,
                5
            );
        }
    }, [addSchoolData, addSchoolError, form]);

    // Handle form submission
    const onFinish = async (values: FieldType) => {
        const isEmailValid = await emailInputRef.current?.validateEmail();
        const isPhoneValid = await phoneInputRef.current?.validatePhone();
        if (!isEmailValid || !isPhoneValid) {
            console.log('Validation failed');
            return;
        }

        const fullPhoneNumber = phoneInputRef.current?.getFormattedPhoneNumber() || values.phone;
        const fileList: File[] = (values.image || [])
            .filter((file) => file.originFileObj)
            .map((file) => file.originFileObj as File);

        const finalValues: SchoolDTO = {
            ...values,
            image: fileList,
            phone: fullPhoneNumber,
        };
        // console.log('Form submitted with values:', finalValues);
        addSchool(finalValues);
    };

    const normFile = (e: { fileList: UploadFile[] } | undefined): UploadFile[] => e?.fileList ?? [];

    return (
        <>
            {contextHolder}
            < div className="mx-auto p-6 rounded-lg shadow-lg" >
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
                            <Form.Item
                                name="name" label="School Name"
                                rules={[{ required: true, message: 'Please enter school name' }]}
                            >
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
                                form={form}
                            />
                            <EmailInput
                                ref={emailInputRef} // Add this line
                                triggerCheckEmail={triggerCheckEmail}
                            />
                            <PhoneInput
                                ref={phoneInputRef}
                                onPhoneChange={(phone) => form.setFieldsValue({ phone })}
                                triggerCheckPhone={triggerCheckPhone}
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
                            <Form.Item name="description" label="School introduction">
                                <MyEditor description={form.getFieldValue('description') || undefined} />
                            </Form.Item>
                            <Form.Item label="School image" name="image" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList || []}>
                                <ImageUpload form={form} fieldName="image" maxCount={10} accept="image/*" maxSizeMB={5} />
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
            </div >
        </>
    );
};

export default SchoolForm;