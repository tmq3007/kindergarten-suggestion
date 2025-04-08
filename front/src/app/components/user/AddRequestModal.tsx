"use client";
import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { useCreateRequestCounsellingMutation } from "@/redux/services/requestCounsellingApi";
import { useGetParentByIdQuery } from "@/redux/services/parentApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
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
    const isParent = userRole === "ROLE_PARENT"

    const { data: parent, isLoading: isParentLoading } = useGetParentByIdQuery(Number(userId), {
        skip: !userId || !isParent,
    });

    const userEmail = parent?.data?.email;
    const userPhone = parent?.data?.phone;
    const userName = parent?.data?.fullname;

    const router = useRouter();

    const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();


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
        if (!isParent) {
            messageApi.error("Please login first!").then(r => console.log(r));
            setIsLoginModalOpen(true)
            setIsModalOpen(false)
        }else{
            setIsModalOpen(true);
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
            message.success(response.message || "Request created successfully!");
            handleCancel();
        } catch (error) {
            message.error("Failed to create request.");
        }
    };


        return (

            <div className="flex items-center justify-center">
                {contextHolder}
                <Button type="primary" onClick={showModal} disabled={isParentLoading}>
                    Request Counselling
                </Button>
                <Modal
                    title={
                    <div  >
                        <div className="text-center mt-1 text-3xl"> Request Counselling</div>
                        <div className="text-center text-md mt-4 text-gray-500">Please check your details below and confirm
                            to submit the request.
                        </div>
                    </div>}
                    footer={
                        <div className="flex justify-center gap-4">
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" loading={isLoading} onClick={handleOk}>
                                Submit
                            </Button>
                        </div>
                    }
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    confirmLoading={isLoading}
                    className={'text-2xl mt-3 p-10 items-center'}
                    centered
                    bodyStyle={{
                        maxHeight: '67vh',
                        overflowY: 'auto',
                        paddingRight: '10px',
                    }}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="name"
                            label="Full Name"
                            rules={[{ required: true, message: "Name is required" }]}
                        >
                            <Input   />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, type: "email", message: "Valid email is required" }]}
                        >
                            <Input  />
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            label="Phone"
                            rules={[{ required: true, message: "Phone is required" }]}
                        >
                            <Input  />
                        </Form.Item>

                        <Form.Item name="inquiry" label="Inquiry" rules={[{ required: true, message: "Please input your inquiry" }]}>
                            <Input.TextArea rows={5} />
                        </Form.Item>

                        <div className="text-center text-sm !mt-1 mb-4 text-gray-500">
                            Our staff will contact you in 24 hrs. If you need urgent counselling,
                            please contact us via our hotline{" "}
                            <a href="tel:09123456888" className="text-blue-400 font-semibold underline hover:text-blue-500">
                                09123456888
                            </a>.
                        </div>

                    </Form>
                </Modal>

                <Modal
                    title={<div className={'text-center text-2xl'}>Login into your account</div>}
                    open={isLoginModalOpen}
                    onOk={() => setIsLoginModalOpen(false)}
                    onCancel={() => setIsLoginModalOpen(false)}
                    centered
                    footer={null}
                    destroyOnClose={true}
                    getContainer={false}

                >
                    <ParentLoginForm
                        onSuccess={() => setIsLoginModalOpen(false)}
                        onCancel={() => {
                            setIsLoginModalOpen(false);
                            setIsSignupModalOpen(true);
                        }}/>
                </Modal>

                {/* Signup Modal */}
                <Modal
                    title={<div className={'text-center text-2xl'}>Create a new user</div>}
                    open={isSignupModalOpen}
                    onOk={() => setIsSignupModalOpen(false)}
                    onCancel={() => setIsSignupModalOpen(false)}
                    centered
                    footer={null}
                    destroyOnClose={true}
                    getContainer={false}
                >
                    <RegisterForm onSuccess={() => {
                        setIsLoginModalOpen(true);
                        setIsSignupModalOpen(false)
                    }} onCancel={() => setIsSignupModalOpen(false)}/>
                </Modal>
            </div>


        );

};

export default RequestCounsellingModal;