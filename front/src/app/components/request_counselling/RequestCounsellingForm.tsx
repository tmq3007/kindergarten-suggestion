'use client'
import React, { useEffect, useRef, useState } from 'react';
import {Form, Input, Select, Button, message, notification, Modal} from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import MyEditor from "@/app/components/common/MyEditor";
import {useParams} from "next/navigation";
import {
    useUpdateRequestCounsellingByAdminMutation,
    useUpdateRequestCounsellingBySchoolOwnerMutation
} from "@/redux/services/requestCounsellingApi";

const { Option } = Select;
const { TextArea } = Input;

interface RequestCounsellingFieldType {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    requested_school: string;
    inquiries: string;
    responses: string;
}


interface RequestCounsellingFormFields {
    isReadOnly?: boolean;
    form?: any;
    formLoaded?: boolean;
    hasResolveButton: boolean;
    isAdmin: boolean;
}

const RequestCounsellingForm: React.FC<RequestCounsellingFormFields> = ({
                                                                            isReadOnly,
                                                                            form: externalForm,
                                                                            formLoaded = false,
                                                                            hasResolveButton = true,
                                                                            isAdmin = true
                                                                        }) => {
    const [form] = Form.useForm(externalForm);
    const [responseContent, setResponseContent] = useState<string>("");
    const params = useParams();
    const requestCounsellingId = Number(params.id as string);
    const [updateRequestCounsellingByAdmin, {isLoading, isError}] = useUpdateRequestCounsellingByAdminMutation();
    const [updateRequestCounsellingBySchoolOwner, {isLoading: isLoading2, isError: isError2}] = useUpdateRequestCounsellingBySchoolOwnerMutation();
    const [modalVisible, setModalVisible] = useState(false);
    const [notificationApi, contextHolder] = notification.useNotification();

    const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
        notificationApi[type]({ message, description, placement: "topRight" });
    };

    const handleResponseChange = (response: string) => {
        setResponseContent(response);
    };

    const handleResolveButton = async () => {
        setModalVisible(true);
    }

    const handleConfirmActionByAdmin = async () => {
        try {
            await updateRequestCounsellingByAdmin({
                requestCounsellingId: requestCounsellingId,
                response: responseContent
            }).unwrap()
            setModalVisible(false);
            openNotificationWithIcon("success", "Success", "Request resolved successfully!")
        } catch (e) {
            openNotificationWithIcon("error", "Error", "Failed to resolve request!")
        }
    }

    const handleConfirmActionBySchoolOwner = async () => {
        try {
            await updateRequestCounsellingBySchoolOwner({
                requestCounsellingId: requestCounsellingId,
                response: responseContent
            }).unwrap()
            setModalVisible(false);
            openNotificationWithIcon("success", "Success", "Request resolved successfully!")
        } catch (e) {
            openNotificationWithIcon("error", "Error", "Failed to resolve request!")
        }
    }

    return (
        <>
            {contextHolder}
        <div className="w-full lg:w-2/3 mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form<RequestCounsellingFieldType>
                size="middle"
                form={form}
                labelCol={{ span: 6, className: 'font-bold' }}
                labelAlign="left"
                labelWrap
                layout="horizontal"
                className="space-y-6 h-auto"
            >
                <Form.Item
                    name="full_name"
                    label="Full Name"

                >
                    <Input placeholder="Enter your name..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                >
                    <Input placeholder="Enter your email..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Phone No."
                >
                    <Input placeholder="Enter your phone number..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Address"
                >
                    <Input placeholder="Enter your address..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="requested_school"
                    label="Requested school"
                >
                    <Input placeholder="Enter your phone number..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="inquiries"
                    label="Inquiries"
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter your inquiry..."
                        readOnly={isReadOnly}
                    />
                </Form.Item>

            </Form>
        </div>

    <div className="w-full lg:w-2/3 mx-auto p-6 bg-white rounded-lg shadow-md mt-5">
        <Form<RequestCounsellingFieldType>
            size="middle"
            form={form}
            labelCol={{ span: 6, className: 'font-bold' }}
            labelAlign="left"
            labelWrap
            layout="horizontal"
            className="space-y-6 h-auto"
        >

            {(hasResolveButton && (
                <Form.Item
                    name="responses"
                    label="Responses"
                >
                <MyEditor
                    description={responseContent}
                    onChange={handleResponseChange} />
                </Form.Item>

            ) || <Form.Item
                name="responses"
                label="Responses"
            >
                <div
                    className="text-gray-800"
                    dangerouslySetInnerHTML={{__html: form.getFieldValue("responses") || "N/A"}}
                />

            </Form.Item>)}
            {hasResolveButton && (
            <Form.Item className={'flex justify-end'}>
                <Button htmlType="button" onClick={handleResolveButton}
                        className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}>
                    Resolve
                </Button>
            </Form.Item>
            )}
        </Form>

        <Modal
            title={<p className={'font-bold text-3xl text-start'}>{"Resolve request"}</p>}
            open={modalVisible}
            onOk={isAdmin ? handleConfirmActionByAdmin : handleConfirmActionBySchoolOwner}
            onCancel={() => {
                setModalVisible(false);
            }}
            okText="Yes"
            cancelText="No, Take me back!"
            confirmLoading={isAdmin ? isLoading : isLoading2}
            getContainer={false}
        >
            <p className={'text-lg text-start'}>{"Are you sure you want to resolve this request?"}</p>
        </Modal>
        </div>


            </>
    );
};

export default RequestCounsellingForm;