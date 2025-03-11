'use client'
import React, { useState } from 'react';
import {
    Button, DatePicker, Form, Input, Select, Space, Typography, notification, Image, Spin, InputProps
} from 'antd';
import { Breadcrumb, Input as AntdInput } from 'antd';
import Link from "next/link";
import dayjs from "dayjs";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setUser } from '@/redux/features/userCreateSlice';
import { Country, useGetCountriesQuery } from "@/redux/services/registerApi";
import { useCreateUserMutation } from "@/redux/services/adminApi";
import countriesKeepZero from "@/lib/countriesKeepZero";
import { motion, Variants } from 'framer-motion';

const { Title } = Typography;
const { TextArea } = AntdInput; // Importing TextArea from AntdInput

const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 8 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
};

// Animation variants for fade-in and slide-up effect with staggered delays
const fadeInUpVariants: Variants = {
    initial: { opacity: 0, y: 50 },
    animate: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, delay: i * 0.1 }
    }),
};

const CreateUser: React.FC = () => {
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const dispatch = useDispatch<AppDispatch>();
    const [createUser] = useCreateUserMutation();
    const [spinning, setSpinning] = React.useState(false);
    const [percent, setPercent] = React.useState(0);
    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
        countries?.find((c) => c.code === "VN") // Default to Vietnam
    );
    const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined); // Track selected role

    const onFinish = async (values: any) => {
        setSpinning(true);
        const countriesWithTrunkPrefix = countries
            ? countries
                .filter(country => country.idd?.root)
                .map(country => country.cca2)
            : [];

        const selectedCountryCode = selectedCountry?.dialCode || "+84";
        const shouldKeepZero = countriesKeepZero.includes(selectedCountryCode);
        const formattedPhone = shouldKeepZero
            ? `${selectedCountryCode}${values.phone}`
            : `${selectedCountryCode}${values.phone.replace(/^0+/, "")}`;

        let formattedValues = {
            ...values,
            dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
            role: values.role === "parent" ? "ROLE_PARENT" : "ROLE_" + values.role.toUpperCase(),
            phone: formattedPhone,
            status: Boolean(values.status),
            email: values.email,
            ...(values.expectedSchool && { expectedSchool: values.expectedSchool }), // Add expectedSchool if present
        };

        try {
            const response = await createUser(formattedValues).unwrap();
            if (response.data) {
                dispatch(setUser(formattedValues));
                openNotificationWithIcon('success', 'User created successfully!', 'Check your email for username and password.');
                form.resetFields();
            } else {
                openNotificationWithIcon('error', 'User creation failed!', 'An unexpected error occurred.');
            }
        } catch (error: any) {
            openNotificationWithIcon('error', 'User creation failed!', error?.data?.message || 'An error occurred while creating the user.');
        } finally {
            setSpinning(false);
        }
    };

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({ message, description });
    };

    const handleCountryChange = (value: string) => {
        if (countries) {
            const country = countries.find((c) => c.code === value);
            if (country) setSelectedCountry(country);
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
    };

    const handleRoleChange = (value: string) => {
        setSelectedRole(value); // Update selected role
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

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="w-full max-w-[600px] mx-auto mt-3"
            >
                <Form
                    {...formItemLayout}
                    form={form}
                    labelCol={{ flex: '120px' }}
                    labelAlign="left"
                    labelWrap
                    onFinish={onFinish}
                >
                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={0}>
                        <Form.Item label="User Name" name="username">
                            <Input placeholder="System Auto Generate" disabled />
                        </Form.Item>
                    </motion.div>

                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={1}>
                        <Form.Item
                            label="Full Name"
                            name="fullname"
                            rules={[
                                { required: true, message: 'Full name is required!' },
                                { pattern: /^[A-Za-zÀ-ỹ]+(\s+[A-Za-zÀ-ỹ]+)+$/, message: 'Full name must contain at least two words!' },
                                { max: 50, message: 'Full name must not exceed 50 characters!' }
                            ]}
                            hasFeedback
                        >
                            <Input />
                        </Form.Item>
                    </motion.div>

                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={2}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Email is required!' },
                                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address!' }
                            ]}
                            hasFeedback
                        >
                            <Input />
                        </Form.Item>
                    </motion.div>

                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={3}>
                        <Form.Item
                            label="Phone No."
                            name="phone"
                            rules={[
                                { required: true, message: 'Phone number is required!' },
                                { pattern: /^\d{4,14}$/, message: 'Phone number is wrong!' }
                            ]}
                        >
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <Select
                                    value={selectedCountry?.code || "VN"}
                                    loading={isLoadingCountry}
                                    onChange={handleCountryChange}
                                    style={{ width: 120, borderRight: "1px #ccc" }}
                                    optionLabelProp="label2"
                                    showSearch={false}
                                >
                                    {countries?.map((country) => (
                                        <Select.Option
                                            key={country.code}
                                            value={country.code}
                                            label={country.label}
                                            label2={
                                                <span className="flex items-center">
                                                    <Image src={country.flag} alt={country.label} width={20} height={14} className="mr-2" preview={false} />
                                                    {country.code} {country.dialCode}
                                                </span>
                                            }
                                        >
                                            <div className="flex items-center">
                                                <Image src={country.flag} alt={country.label} width={20} height={14} className="mr-2" />
                                                {country.dialCode} - {country.label}
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Input
                                    placeholder="Enter your phone number"
                                    onChange={handlePhoneNumberChange}
                                    style={{ flex: 1, border: "none", boxShadow: "none" }}
                                />
                            </div>
                        </Form.Item>
                    </motion.div>

                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={4}>
                        <Form.Item
                            label="DOB"
                            name="dob"
                            required={true}
                            rules={[{
                                validator: (_, value) => {
                                    if (!value) return Promise.reject('Date of birth is required!');
                                    if (value.isAfter(dayjs())) return Promise.reject('Date of birth cannot be in the future!');
                                    return Promise.resolve();
                                }
                            }]}
                        >
                            <DatePicker disabledDate={(current) => current && current > dayjs().endOf('day')} />
                        </Form.Item>
                    </motion.div>

                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={5}>
                        <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select a role!' }]}>
                            <Select
                                placeholder="Select a role"
                                onChange={handleRoleChange} // Track role change
                                options={[
                                    { value: 'admin', label: 'Admin' },
                                    { value: 'school_owner', label: 'School Owner' },
                                ]}
                            />
                        </Form.Item>
                    </motion.div>

                    {/* Conditional Expected School TextArea */}
                    {selectedRole === 'school_owner' && (
                        <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={6}>
                            <Form.Item
                                label="Expected "
                                name="expectedSchool"
                                rules={[
                                    { required: true, message: 'Expected school name is required for School Owner!' },
                                    { max: 200, message: 'Expected school name must not exceed 200 characters!' }
                                ]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Enter the expected school name"
                                />
                            </Form.Item>
                        </motion.div>
                    )}

                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={selectedRole === 'school_owner' ? 7 : 6}>
                        <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please choose status!' }]}>
                            <Select
                                placeholder="Select status"
                                options={[
                                    { value: true, label: 'Active' },
                                    { value: false, label: 'Inactive' },
                                ]}
                            />
                        </Form.Item>
                    </motion.div>

                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={selectedRole === 'school_owner' ? 8 : 7}>
                        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                            <Space className="absolute bottom-6 top-1">
                                <Link href={'/admin/management/user/user-list'}>
                                    <Button type="dashed" htmlType="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Space>
                        </Form.Item>
                    </motion.div>
                </Form>
            </motion.div>
            <Spin spinning={spinning} percent={percent} fullscreen />
        </div>
    );
};

export default CreateUser;