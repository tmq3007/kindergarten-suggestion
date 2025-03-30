"use client";
import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { useCreateRequestCounsellingMutation } from "@/redux/services/requestCounsellingApi";
import { useGetParentByIdQuery } from "@/redux/services/parentApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { DateTime } from "luxon";

const RequestCounsellingModal: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [createRequest, { isLoading }] = useCreateRequestCounsellingMutation();

    // Get user info from Redux store
    const userRole = useSelector((state: RootState) => state.user?.role);
    const userId = useSelector((state: RootState) => state.user?.id);
    const isAdminOrSO = userRole === "ROLE_ADMIN" || userRole === "ROLE_SCHOOL_OWNER";

    // Fetch parent data
    const { data: parent, isLoading: isParentLoading } = useGetParentByIdQuery(Number(userId), {
        skip: !userId || isAdminOrSO, // Skip if no userId or user is admin/school owner
    });

    // Extract user data from parent response
    const userEmail = parent?.data?.email;
    const userPhone = parent?.data?.phone;
    const userName = parent?.data?.fullname; // Adjust to match your API response (e.g., fullName)

    // Update form fields when parent data changes
    useEffect(() => {
        if (isModalOpen && userId && !isAdminOrSO && parent?.data) {
            form.setFieldsValue({
                userId,
                schoolId: 1, // Default schoolId
                email: userEmail || "",
                phone: userPhone || "",
                name: userName || "",
            });
        }
    }, [parent, isModalOpen, userId, isAdminOrSO, form]);

    const showModal = () => {
        setIsModalOpen(true);
        if (!userId || isAdminOrSO) {
            form.setFieldsValue({ schoolId: 1 });
        }
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
                userId: userId,
                schoolId: 1,
                status: 0,
                dueDate: DateTime.now().toISO({ includeOffset: false }),
            }).unwrap();
            message.success(response.message || "Request created successfully!");
            handleCancel();
        } catch (error) {
            message.error("Failed to create request.");
        }
    };

    if (!isAdminOrSO) {
        return (
            <div className="flex items-center mt-20 justify-center h-screen">
                <Button type="primary" onClick={showModal} disabled={isParentLoading}>
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
                        <Form.Item name="schoolname" label="School Name">
                            <Input disabled />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, type: "email", message: "Valid email is required" }]}
                        >
                            <Input readOnly={!!userEmail} />
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            label="Phone"
                            rules={[{ required: true, message: "Phone is required" }]}
                        >
                            <Input readOnly={!!userPhone} />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: "Name is required" }]}
                        >
                            <Input readOnly={!!userName} />
                        </Form.Item>
                        <Form.Item name="inquiry" label="Inquiry">
                            <Input.TextArea required={true} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    } else {
        return null;
    }
};

export default RequestCounsellingModal;