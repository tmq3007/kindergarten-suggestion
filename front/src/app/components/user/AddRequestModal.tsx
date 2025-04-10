"use client";
import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Input, notification } from "antd";
import { useCreateRequestCounsellingMutation } from "@/redux/services/requestCounsellingApi";
import { useGetParentByIdQuery } from "@/redux/services/parentApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { DateTime } from "luxon";
import ParentLoginForm from "@/app/components/user/ParentLoginForm";
import RegisterForm from "@/app/components/user/RegisterForm";

interface Props {
    schoolId: number;
    schoolName: String;
}

const RequestCounsellingModal: React.FC<Props> = ({ schoolId, schoolName }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [createRequest, { isLoading }] = useCreateRequestCounsellingMutation();

    const userRole = useSelector((state: RootState) => state.user?.role);
    const userId = useSelector((state: RootState) => state.user?.id);
    const isParent = userRole === "ROLE_PARENT";
    const isAdminOrSo = userRole === "ROLE_ADMIN" || userRole === "ROLE_SCHOOL_OWNER";

    const { data: parent, isLoading: isParentLoading } = useGetParentByIdQuery(Number(userId), {
        skip: !userId || !isParent,
    });

    const userEmail = parent?.data?.email;
    const userPhone = parent?.data?.phone;
    const userName = parent?.data?.fullname;

    const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [notificationApi, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (isModalOpen && userId && isParent && parent?.data) {
            form.setFieldsValue({
                userId,
                schoolName: schoolName,
                email: userEmail || "",
                phone: userPhone || "",
                name: userName || "",
            });
        }
    }, [parent, isModalOpen, userId, isParent, schoolId, form]);

    const showModal = () => {
        if (isParent) {
            setIsModalOpen(true);
        } else if (isAdminOrSo) {
            notificationApi.error({
                message: "Access Denied",
                description: "You have to be a parent to request counselling! Please login or sign up to continue.",
            });
        } else {
            notificationApi.error({
                message: "Access Denied",
                description: "You have to be a parent to request counselling! Please login or sign up to continue.",
            });
            setIsLoginModalOpen(true);
            setIsModalOpen(false);
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
                schoolId: schoolId,
                status: 0,
                dueDate: DateTime.now().toISO({ includeOffset: false }),
            }).unwrap();
            notificationApi.success({
                message: "Success",
                description: response.message || "Request created successfully!",
            });
            handleCancel();
        } catch (error) {
            notificationApi.error({
                message: "Error",
                description: "Failed to create request.",
            });
        }
    };

    return (
        <div className="flex items-center justify-center w-full  ">
            {contextHolder}
            <Button
                type="primary"
                onClick={showModal}
                disabled={isParentLoading}
                className="!w-[180px] sm:w-full"
            >
                Request Counselling
            </Button>

            <Modal
                title={
                    <div className="text-center">
                        <div className="text-lg sm:text-2xl md:text-3xl font-bold mb-2">Request Counselling</div>
                        <div className="text-xs sm:text-sm md:text-md text-gray-500">
                            Please check your details below and confirm to submit the request.
                        </div>
                    </div>
                }
                footer={
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={handleCancel}
                            className="w-24"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            loading={isLoading}
                            onClick={handleOk}
                            className="w-24"
                        >
                            Submit
                        </Button>
                    </div>
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={isLoading}
                className="!w-full sm:!w-4/5 md:!w-3/5 lg:!w-2/5 max-w-2xl px-4 sm:px-6 md:px-8"
                centered
                bodyStyle={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                    padding: "1rem",
                }}
            >
                <Form form={form} layout="vertical" className="space-y-4">
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: "Name is required" }]}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: "email", message: "Valid email is required" }]}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[{ required: true, message: "Phone is required" }]}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name="inquiry"
                        label="Inquiry"
                        rules={[{ required: true, message: "Please input your inquiry" }]}
                    >
                        <Input.TextArea rows={3} className="w-full" />
                    </Form.Item>

                    <div className="text-center text-xs sm:text-sm text-gray-500">
                        Our staff will contact you in 24 hrs. If you need urgent counselling, please contact us via our
                        hotline{" "}
                        <a href="tel:09123456888" className="text-blue-400 font-semibold underline hover:text-blue-500">
                            09123456888
                        </a>.
                    </div>
                </Form>
            </Modal>

            <Modal
                title={<div className="text-center text-lg sm:text-xl md:text-2xl font-bold">Login into your account</div>}
                open={isLoginModalOpen}
                onOk={() => setIsLoginModalOpen(false)}
                onCancel={() => setIsLoginModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
                className="!w-full sm:!w-4/5 md:!w-3/5 lg:!w-2/5 max-w-xl px-4 sm:px-6"
            >
                <ParentLoginForm
                    onSuccess={() => setIsLoginModalOpen(false)}
                    onCancel={() => {
                        setIsLoginModalOpen(false);
                        setIsSignupModalOpen(true);
                    }}
                />
            </Modal>

            <Modal
                title={<div className="text-center text-lg sm:text-xl md:text-2xl font-bold">Create a new user</div>}
                open={isSignupModalOpen}
                onOk={() => setIsSignupModalOpen(false)}
                onCancel={() => setIsSignupModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
                className="!w-full sm:!w-4/5 md:!w-3/5 lg:!w-2/5 max-w-xl px-4 sm:px-6"
            >
                <RegisterForm
                    onSuccess={() => {
                        setIsLoginModalOpen(true);
                        setIsSignupModalOpen(false);
                    }}
                    onCancel={() => setIsSignupModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default RequestCounsellingModal;