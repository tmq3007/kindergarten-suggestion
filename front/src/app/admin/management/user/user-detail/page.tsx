'use client'
import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import {
    Button,
    DatePicker,
    Form,
    Input,
    Select,
    Space,
    Breadcrumb,
} from 'antd';
import Link from "next/link";
import dayjs from 'dayjs';
const formItemLayout = {
    labelCol: { sm: { span: 6 } },
    wrapperCol: { sm: { span: 14 } },
};

const UserDetail: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const [loading, setLoading] = useState(false);
    const [userStatus, setUserStatus] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const userId = searchParams.get('userId'); // Lấy userId từ URL

    useEffect(() => {
        if (userId) {
            fetchUserData(userId);
        }
    }, [userId]);

    const fetchUserData = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/user/detail?userId=${id}`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
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

            setUserStatus(user.status); // Cập nhật trạng thái user
        } catch (error) {
            console.error("Have error when loading user data:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = () => {
        if (userId) {
            router.push(`/admin/management/user/edit-user?userId=${userId}`);
        }
    };

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({
            message,
            description,
            placement: 'topRight',
        });
    };

    const toggleStatus = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/user/toggle?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || `HTTP error! Status: ${res.status}`);
            }

            const updatedUser = data.data;
            setUserStatus(updatedUser.status);
            form.setFieldsValue({ status: updatedUser.status });

            openNotificationWithIcon('success', 'Success', data.message);
        } catch (error) {
            openNotificationWithIcon('error', 'Failed to update user status', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Breadcrumb
                items={[
                    { title: <Link href="/management/user/user-detail">User Management</Link> },
                    { title: 'User Details' },
                ]}
            />

            <Form
                {...formItemLayout}
                form={form}
                labelAlign="left"
                labelWrap
                style={{ maxWidth: 600 }}
                className="w-full mx-auto mt-5"
            >
                <Form.Item label="User Name" name="username">
                    <Input readOnly style={{ background: "transparent", color: "#000" }} />
                </Form.Item>

                <Form.Item label="Full Name" name="fullname">
                    <Input readOnly style={{ background: "transparent", color: "#000" }} />
                </Form.Item>

                <Form.Item label="Email" name="email">
                    <Input readOnly style={{ background: "transparent", color: "#000" }} />
                </Form.Item>

                <Form.Item label="Phone No." name="phonenumber">
                    <Input readOnly style={{ background: "transparent", color: "#000" }} />
                </Form.Item>

                <Form.Item label="DOB" name="DOB">
                    <DatePicker
                        allowClear={false}  // 🔹 Ẩn nút X
                        disabled
                        style={{ width: "100%", background: "transparent", color: "#000" }}
                    />
                </Form.Item>

                <Form.Item label="Role" name="role">
                    <Select
                        style={{ pointerEvents: "none", background: "transparent", color: "#000" }}
                        options={[
                            { label: 'Admin', value: 'Admin' },
                            { label: 'Parent', value: 'Parent' },
                            { label: 'School Owner', value: 'School Owner' },
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Status" name="status">
                    <Select
                        style={{ pointerEvents: "none", background: "transparent", color: "#000" }}
                        options={[
                            { label: 'Active', value: 'Active' },
                            { label: 'Inactive', value: 'Inactive' },
                        ]}
                    />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                    <Space>
                        <Button type="dashed" onClick={toggleStatus} loading={loading}>
                            {userStatus === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button type="dashed" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={handleEdit}>Edit</Button>
                    </Space>
                </Form.Item>
            </Form>
        </>
    );
};

export default UserDetail;
