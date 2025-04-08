// "use client";
// import React, { useState, useEffect } from "react";
// import { Button, Modal, Form, Input, message } from "antd";
// import { useCreateRequestCounsellingMutation } from "@/redux/services/requestCounsellingApi";
// import { useGetParentByIdQuery } from "@/redux/services/parentApi";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
// import { DateTime } from "luxon";
//
// interface Props {
//     schoolId: number;
//     schoolName: String;
// }
//
// const RequestCounsellingModal: React.FC<Props> = ({ schoolId, schoolName }) => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [form] = Form.useForm();
//     const [createRequest, { isLoading }] = useCreateRequestCounsellingMutation();
//
//     const userRole = useSelector((state: RootState) => state.user?.role);
//     const userId = useSelector((state: RootState) => state.user?.id);
//     const isAdminOrSO = userRole === "ROLE_ADMIN" || userRole === "ROLE_SCHOOL_OWNER";
//
//     const { data: parent, isLoading: isParentLoading } = useGetParentByIdQuery(Number(userId), {
//         skip: !userId || isAdminOrSO,
//     });
//
//     const userEmail = parent?.data?.email;
//     const userPhone = parent?.data?.phone;
//     const userName = parent?.data?.fullname;
//
//     useEffect(() => {
//         if (isModalOpen && userId && !isAdminOrSO && parent?.data) {
//             form.setFieldsValue({
//                 userId,
//                 schoolname: schoolName,
//                 email: userEmail || "",
//                 phone: userPhone || "",
//                 name: userName || "",
//             });
//         }
//     }, [parent, isModalOpen, userId, isAdminOrSO, schoolId, form]);
//
//     const showModal = () => {
//         setIsModalOpen(true);
//         if (!userId || isAdminOrSO) {
//             form.setFieldsValue({ schoolId });
//         }
//     };
//
//     const handleCancel = () => {
//         setIsModalOpen(false);
//         form.resetFields();
//     };
//
//     const handleOk = async () => {
//         try {
//             const values = await form.validateFields();
//             const response = await createRequest({
//                 ...values,
//                 userId: userId,
//                 schoolId: schoolId,
//                 status: 0,
//                 dueDate: DateTime.now().toISO({ includeOffset: false }),
//             }).unwrap();
//             message.success(response.message || "Request created successfully!");
//             handleCancel();
//         } catch (error) {
//             message.error("Failed to create request.");
//         }
//     };
//
//     if (!isAdminOrSO) {
//         return (
//             <div className="flex items-center justify-center">
//                 <Button type="primary" onClick={showModal} disabled={isParentLoading}>
//                     Request Counselling
//                 </Button>
//                 <Modal
//                     title="Request Counselling"
//                     open={isModalOpen}
//                     onOk={handleOk}
//                     onCancel={handleCancel}
//                     confirmLoading={isLoading}
//                 >
//                     <Form form={form} layout="vertical">
//                         <Form.Item name="schoolname" label="School Name">
//                             <Input readOnly />
//                         </Form.Item>
//                         <Form.Item
//                             name="email"
//                             label="Email"
//                             rules={[{ required: true, type: "email", message: "Valid email is required" }]}
//                         >
//                             <Input readOnly={!!userEmail} />
//                         </Form.Item>
//                         <Form.Item
//                             name="phone"
//                             label="Phone"
//                             rules={[{ required: true, message: "Phone is required" }]}
//                         >
//                             <Input readOnly={!!userPhone} />
//                         </Form.Item>
//                         <Form.Item
//                             name="name"
//                             label="Name"
//                             rules={[{ required: true, message: "Name is required" }]}
//                         >
//                             <Input readOnly={!!userName} />
//                         </Form.Item>
//                         <Form.Item name="inquiry" label="Inquiry" rules={[{ required: true, message: "Please input your inquiry" }]}>
//                             <Input.TextArea rows={5} />
//                         </Form.Item>
//                     </Form>
//                 </Modal>
//             </div>
//         );
//     } else {
//         return null;
//     }
// };
//
// export default RequestCounsellingModal;


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

    // Hardcode test values here or fetch them dynamically
    const schoolId = 1;
    const schoolName = "a";

    const userRole = useSelector((state: RootState) => state.user?.role);
    const userId = useSelector((state: RootState) => state.user?.id);
    const isAdminOrSO = userRole === "ROLE_ADMIN" || userRole === "ROLE_SCHOOL_OWNER";

    const { data: parent, isLoading: isParentLoading } = useGetParentByIdQuery(Number(userId), {
        skip: !userId || isAdminOrSO,
    });

    const userEmail = parent?.data?.email;
    const userPhone = parent?.data?.phone;
    const userName = parent?.data?.fullname;

    useEffect(() => {
        if (isModalOpen && userId && !isAdminOrSO && parent?.data) {
            form.setFieldsValue({
                userId,
                schoolName: schoolName,
                email: userEmail || "",
                phone: userPhone || "",
                name: userName || "",
            });
        }
    }, [parent, isModalOpen, userId, isAdminOrSO, schoolId, form]);

    const showModal = () => {
        setIsModalOpen(true);
        if (!userId || isAdminOrSO) {
            form.setFieldsValue({ schoolId });
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

    if (!isAdminOrSO) {
        return (
            <div className="flex mt-[100px] items-center justify-center">
                <Button type="primary" onClick={showModal} disabled={isParentLoading}>
                    Request Counselling
                </Button>
                <Modal
                    title="Request Counselling"
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    confirmLoading={isLoading}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="schoolName" label="School Name">
                            <Input readOnly />
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
                        <Form.Item name="inquiry" label="Inquiry" rules={[{ required: true, message: "Please input your inquiry" }]}>
                            <Input.TextArea rows={5} />
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
