"use client";
import React, { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { useCreateRequestCounsellingMutation } from "@/redux/services/requestCounsellingApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { DateTime } from "luxon";
const RequestCounsellingModal: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [createRequest, { isLoading }] = useCreateRequestCounsellingMutation();

    const userRole = useSelector((state: RootState) => state.user?.role);
    const userId = useSelector((state: RootState) => state.user?.id);

    const isParent = userRole === "ROLE_PARENT";

    const showModal = () => {
        setIsModalOpen(true);
        form.setFieldsValue({ userId, schoolId: 1 });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const response = await createRequest({
                ...values,
                status: 0,
                dueDate: DateTime.now().toISO({ includeOffset: false }) // Loại bỏ múi giờ
            }).unwrap();
            message.success(response.message || "Request created successfully!");
            handleCancel();
        } catch (error) {
            message.error("Failed to create request.");
        }
    };


    if (!isParent) return null;

    return (
        <div className="flex items-center mt-20 justify-center h-screen">
            <Button type="primary" onClick={showModal}>
                Open Modal
            </Button>
            <Modal
                title="Request Counselling"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={isLoading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="userId" label="User ID">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="schoolId" label="School ID">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Valid email is required" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Phone is required" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="inquiry" label="Inquiry">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RequestCounsellingModal;
