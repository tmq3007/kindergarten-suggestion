'use client';
import React, { useEffect } from 'react';
import { Spin, Button, DatePicker, Form, Input, Select, Space, Breadcrumb, notification } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import {useGetUserDetailQuery, useToggleUserStatusMutation} from "@/redux/services/userApi";

const formItemLayout = {
    labelCol: { sm: { span: 6 } },
    wrapperCol: { sm: { span: 14 } },
};

const UserDetail: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId'); // Lấy userId từ URL

    // Sử dụng RTK Query để lấy dữ liệu user
    const { data: userData, isLoading, isError } = useGetUserDetailQuery(Number(userId), {
        skip: !userId,
    });

    // Sử dụng mutation để toggle status
    const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

    useEffect(() => {
        if (userData?.data) {
            const user = userData.data;
            form.setFieldsValue({
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                phonenumber: user.phone,
                DOB: user.dob ? dayjs(user.dob) : null,
                role: user.role,
                status: user.status,
            });
        }
    }, [userData, form]);

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

    const handleToggleStatus = async () => {
        if (!userId) return;

        try {
            const result = await toggleUserStatus(Number(userId)).unwrap(); // Gọi mutation và lấy kết quả
            const updatedUser = result.data;
            form.setFieldsValue({ status: updatedUser.status });

            openNotificationWithIcon('success', 'Success', result.message || 'User status updated successfully');
        } catch (error) {
            openNotificationWithIcon(
                'error',
                'Failed to update user status',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (isError || !userData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
                Error loading user data. Please try again later.
            </div>
        );
    }

    return (
        <>
            {contextHolder}
            <Breadcrumb
                items={[
                    { title: <Link href="/admin/management/user/user-detail">User Management</Link> },
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
                    <Input readOnly style={{ background: 'transparent', color: '#000' }} />
                </Form.Item>

                <Form.Item label="Full Name" name="fullname">
                    <Input readOnly style={{ background: 'transparent', color: '#000' }} />
                </Form.Item>

                <Form.Item label="Email" name="email">
                    <Input readOnly style={{ background: 'transparent', color: '#000' }} />
                </Form.Item>

                <Form.Item label="Phone No." name="phonenumber">
                    <Input readOnly style={{ background: 'transparent', color: '#000' }} />
                </Form.Item>

                <Form.Item label="DOB" name="DOB">
                    <DatePicker
                        allowClear={false}
                        disabled
                        style={{ width: '100%', background: 'transparent', color: '#000' }}
                    />
                </Form.Item>

                <Form.Item label="Role" name="role">
                    <Select
                        style={{ pointerEvents: 'none', background: 'transparent', color: '#000' }}
                        options={[
                            { label: 'Admin', value: 'Admin' },
                            { label: 'Parent', value: 'Parent' },
                            { label: 'School Owner', value: 'School Owner' },
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Status" name="status">
                    <Select
                        style={{ pointerEvents: 'none', background: 'transparent', color: '#000' }}
                        options={[
                            { label: 'Active', value: 'Active' },
                            { label: 'Inactive', value: 'Inactive' },
                        ]}
                    />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                    <Space>
                        <Button type="dashed" onClick={handleToggleStatus} loading={isToggling}>
                            {form.getFieldValue('status') === 'Active' ? 'Deactivate' : 'Activate'}
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