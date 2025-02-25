'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Button, DatePicker, Form, Input, Select, Space, Breadcrumb, notification
} from 'antd';
import Link from "next/link";
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
const formItemLayout = {
    labelCol: { sm: { span: 6 } },
    wrapperCol: { sm: { span: 14 } },
};

const UserDetail: React.FC = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const [api, contextHolder] = notification.useNotification();

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({
            message,
            description,
            placement: 'topRight',
        });
    };

    useEffect(() => {
        if (userId) {
            fetchUserData(userId);
        }
    }, [userId]);

    const fetchUserData = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/user/detail?userId=${id}`);
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            const data = await res.json();
            const user = data.data;

            form.setFieldsValue({
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                phonenumber: user.phone,
                DOB: user.dob ? dayjs(user.dob) : null,
                role: user.role,
                status: user.status,
            });

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu user:", error);
            openNotificationWithIcon('error', 'Load Failed', 'Không thể tải thông tin người dùng.');
        } finally {
            setLoading(false);
        }
    };

    const onSave = async (values: any) => {
        if (!userId) return;
        setSaving(true);
        try {
            const payload = {
                id: userId,
                username: values.username,
                fullname: values.fullname,
                email: values.email,
                phone: values.phonenumber,
                dob: values.DOB ? values.DOB.format('YYYY-MM-DD') : null,
                role: values.role,
                status: values.status,
            };

            const res = await fetch("http://localhost:8080/api/user/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            let responseBody;
            try {
                responseBody = await res.json();
            } catch (jsonError) {
                responseBody = null;
            }

            console.log("API response:", responseBody);

            if (!res.ok) {
                console.error("Error response from API:", responseBody || "No response body");

                if (responseBody?.fieldErrors?.length) {
                    responseBody.fieldErrors.forEach((error: any) => {
                        openNotificationWithIcon('error', 'Validation Error', `${error.message} (Field: ${error.property})`);
                    });
                } else {
                    openNotificationWithIcon('error', 'Error', responseBody?.message || `HTTP error! Status: ${res.status}`);
                }

                return;
            }

            openNotificationWithIcon('success', 'Success', 'User updated successfully!');
            form.setFieldsValue(payload);

        } catch (error: any) {
            console.error("Error updating user:", error);
            openNotificationWithIcon('error', 'Update Failed', `Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Breadcrumb
                items={[
                    { title: <Link href="/management/user/user_detail">User Management</Link> },
                    { title: 'Edit User' },
                ]}
            />

            <Form
                {...formItemLayout}
                form={form}
                labelAlign="left"
                labelWrap
                style={{ maxWidth: 600 }}
                className="w-full mx-auto mt-5"
                onFinish={onSave}
            >
                <Form.Item
                    label={<span>* User Name</span>}
                    name="username"
                    rules={[{ required: true, message: 'User Name is required!' }]}
                >
                    <Input readOnly style={{ background: "transparent", color: "#000" }} />
                </Form.Item>

                <Form.Item
                    label={<span>* Full Name</span>}
                    name="fullname"
                    rules={[{ required: true, message: 'Full Name is required!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={<span>* Email</span>}
                    name="email"
                    rules={[
                        { required: true, message: 'Email is required!' },
                        { type: 'email', message: 'Please enter a valid email address!' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={<span>* Phone No.</span>}
                    name="phonenumber"
                    rules={[
                        { required: true, message: 'Phone number is required!' },
                        { pattern: /^0\d{9}$/, message: 'Phone number must be 10 digits and start with 0!' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={<span>* DOB</span>}
                    name="DOB"
                    rules={[{ required: true, message: 'Date of Birth is required!' }]}
                >
                    <DatePicker allowClear={false} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label={<span>* Role</span>}
                    name="role"
                    rules={[{ required: true, message: 'Role is required!' }]}
                >
                    <Select
                        options={[
                            { label: 'Admin', value: 'Admin' },
                            { label: 'Parent', value: 'Parent' },
                            { label: 'School Owner', value: 'School Owner' },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    label={<span>* Status</span>}
                    name="status"
                    rules={[{ required: true, message: 'Status is required!' }]}
                >
                    <Select
                        disabled
                        options={[
                            { label: 'Active', value: 'Active' },
                            { label: 'Inactive', value: 'Inactive' },
                        ]}
                    />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                    <Space>
                        <Button type="dashed" onClick={() => router.back()}>
                            Cancel
                        </Button>

                        <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
                    </Space>
                </Form.Item>
            </Form>
        </>
    );
};

export default UserDetail;
