'use client'
import React from 'react';
import {
    Button, DatePicker, Form, Input, Select, Space, Typography, notification,
} from 'antd';
import { Breadcrumb } from 'antd';
import Link from "next/link";
import dayjs from "dayjs";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setParent } from '@/redux/features/parentSlice';
import { useCreateParentMutation } from '@/redux/services/User/parentApi';
import {   Spin } from 'antd';
import {setSchoolOwner} from "@/redux/features/schoolOwnerSlice";
import {useCreateSchoolOwnerMutation} from "@/redux/services/User/schoolOwnerApi";
import {useCreateAdminMutation} from "@/redux/services/User/adminApi";
const { Option } = Select;
const { Title } = Typography;

const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 8 } }, // Điều chỉnh chiều rộng label
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } }, // Điều chỉnh input field
};

const CreateUser: React.FC = () => {
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const dispatch = useDispatch<AppDispatch>();
    const [createParent] = useCreateParentMutation();
    const [createSchoolOwner] = useCreateSchoolOwnerMutation()
    const [createAdmin] = useCreateAdminMutation()
    const [spinning, setSpinning] = React.useState(false);
    const [percent, setPercent] = React.useState(0);

    const showLoader = () => {
        setSpinning(true);
        let ptg = -10;

        const interval = setInterval(() => {
            ptg += 5;
            setPercent(ptg);

            if (ptg > 120) {
                clearInterval(interval);
                setSpinning(false);
                setPercent(0);
            }
        }, 100);
    };
    const onFinish = async (values: any) => {
        setSpinning(true);
        let formattedValues = {
            ...values,
            dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
            gender: values.gender === "male", // Đúng kiểu Boolean
            status: values.status === "1", // Đúng kiểu Boolean
            role: values.role === "parent" ? "ROLE_PARENT" : "ROLE_" + values.role.toUpperCase(),
        };

        if (formattedValues.role === "ROLE_PARENT") {
            formattedValues = {
                ...formattedValues,
                ward: values.ward || "",
                province: values.province || "",
                street: values.street || "",
                district: values.district || "",
            };
        }

        if (formattedValues.role === "ROLE_SCHOOL_OWNER") {
            formattedValues = {
                ...formattedValues,
                school: values.school || {}, // SchoolDTO
            };
        }

        console.log("formattedValues:",formattedValues)

        try {

            if (formattedValues.role === "ROLE_PARENT") {
                const response = await createParent(formattedValues).unwrap();
                console.log("response",response)
                if (response.data) {
                    dispatch(setParent(formattedValues));
                    openNotificationWithIcon('success', 'User created successfully!', 'Check your email for username and password.');
                    form.resetFields();
                } else {
                    openNotificationWithIcon('error', 'User creation failed!', 'An unexpected error occurred.');
                }
            }else if(formattedValues.role === "ROLE_SCHOOL_OWNER"){
                const response = await createSchoolOwner(formattedValues).unwrap();
                if (response.data) {
                    dispatch(setSchoolOwner(formattedValues));
                    openNotificationWithIcon('success', 'User created successfully!', 'Check your email for username and password.');
                    form.resetFields();
                }else {
                    openNotificationWithIcon('error', 'User creation failed!', 'An unexpected error occurred.');
                }
            }else{
                const response = await createAdmin(formattedValues).unwrap();
                if (response.data) {
                    openNotificationWithIcon('success', 'User created successfully!', 'Check your email for username and password.');
                    form.resetFields();
                }else {
                    openNotificationWithIcon('error', 'User creation failed!', 'An unexpected error occurred.');
                }
            }


        } catch (error: any) {
            openNotificationWithIcon('error', 'User creation failed!', error?.data?.message || 'An error occurred while creating the user.');
        } finally {
            setSpinning(false);
        }
    };

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({
            message,
            description,
        });
    };


    return (
        <div className={'h-[100%] p-0'}>
            {contextHolder}
            <Breadcrumb
                className={'m-0'}
                items={[
                    { title: <Link href="/admin/management/user/user-list">User Management</Link> },
                    { title: 'Add New User' },
                ]}
            />
            <Title level={3} className="mb-1 mt-0.5 ml-16">Add New User</Title>
            <Form
                {...formItemLayout}
                form={form}
                labelCol={{ flex: '120px' }}
                labelAlign="left"
                labelWrap
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
                className="w-full mx-auto mt-3 "
            >
                <Form.Item label="User Name" name="username">
                    <Input placeholder="System Auto Generate" disabled />
                </Form.Item>

                {/* Full Name */}
                <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[
                        { required: true, message: 'Full name is required!' },
                        { pattern: /^[A-Za-zÀ-ỹ]+(\s+[A-Za-zÀ-ỹ]+)+$/, message: 'Full name must contain at least two words!' }
                    ]}
                    hasFeedback
                >
                    <Input />
                </Form.Item>

                {/* Email */}
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Email is required!' },
                        { type: 'email', message: 'Enter a valid email address!' }
                    ]}
                    hasFeedback
                >
                    <Input />
                </Form.Item>

                {/* Phone Number */}
                <Form.Item
                    label="Phone No."
                    name="phone"
                    rules={[
                        { required: true, message: 'Phone number is required!' },
                        { pattern: /^\d{10}$/, message: 'Phone number must be exactly 10 digits!' }
                    ]}
                    hasFeedback
                >
                    <Input />
                </Form.Item>

                <Form.Item label="Gender" name="gender" rules={[{ required: true, message: 'Please select gender!' }]}>
                    <Select
                        placeholder="Select gender"
                        options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                        ]}
                    />

                </Form.Item>

                <Form.Item label="DOB" name="dob" rules={[{ required: true, message: 'Date of birth is required!' }]}>
                    <DatePicker disabledDate={(current) => current && current > dayjs().endOf('day')} />
                </Form.Item>

                <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select a role!' }]}>
                    <Select
                        placeholder="Select a role"
                        options={[
                            { value: 'admin', label: 'Admin' },
                            { value: 'school_owner', label: 'School Owner' },
                            { value: 'parent', label: 'Parent' },
                        ]}
                    />
                </Form.Item>

                <Form.Item initialValue={'1'} label="Status" name="status" rules={[{ required: true, message: 'Please choose status!' }]}>
                    <Select
                        placeholder="Select status"
                        options={[
                            { value: '1', label: 'Active' },
                            { value: '0', label: 'Inactive' },
                        ]}
                    />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                    <Space className="absolute bottom-6 top-1  ">

                        <Link href={'/admin/management/user/user-list'}>
                            <Button type="dashed" htmlType="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button   type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
            <Spin spinning={spinning} percent={percent} fullscreen />
        </div>
    );
};

export default CreateUser;
