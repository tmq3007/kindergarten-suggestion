'use client';
import React, { useEffect, useState } from 'react';
import {
    Button, DatePicker, Form, Input, Select, Space, notification, Image, Spin
} from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { useGetUserDetailQuery, useUpdateUserMutation } from "@/redux/services/userApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { Row, Col } from 'antd';
import { ImageUpload } from "@/app/components/common/ImageUploader";
import { motion, Variants } from 'framer-motion';
import { Country, useGetCountriesQuery } from "@/redux/services/registerApi";
import countriesKeepZero from "@/lib/countriesKeepZero";

const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 6 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
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

const EditUser: React.FC = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [api, contextHolder] = notification.useNotification();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const { data: userData, isLoading, isError } = useGetUserDetailQuery(Number(userId), { skip: !userId });
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();

    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
        countries?.find((c) => c.code === "VN") // Default to Vietnam
    );
    const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
    const [spinning, setSpinning] = useState(false);

    // Fill form with user data when loaded
    useEffect(() => {
        if (userData?.data && countries) {
            const user = userData.data;
            const countryCode = user.phone?.match(/^\+(\d+)/)?.[1];
            const phoneNumber = user.phone?.replace(/^\+\d+/, "");
            const country = countries.find((c) => c.dialCode === `+${countryCode}`);
            setSelectedCountry(country || countries.find((c) => c.code === "VN"));
            const normalizedRole = user.role.toLowerCase().replace(/\s+/g, "_").replace("role_", "");
            setSelectedRole(normalizedRole);

            form.setFieldsValue({
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                phone: phoneNumber,
                dob: user.dob ? dayjs(user.dob) : '',
                role: normalizedRole,
                status: user.status,
                expectedSchool: user.expectedSchool || "",
                business_registration_number: user.business_registration_number || "",
                image: user.imageList && user.imageList.length > 0
                    ? user.imageList.map((img, index) => ({
                        url: img.url,
                        uid: `${index}`,
                        name: img.filename || `license-${index}.jpg`,
                    }))
                    : [],
            });
        }
    }, [userData, countries, form]);

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        api[type]({ message, description, placement: 'topRight' });
    };

    const handleCountryChange = (value: string) => {
        if (countries) {
            const country = countries.find((c) => c.code === value);
            if (country) setSelectedCountry(country);
        }
    };

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        form.setFieldsValue({ phone: value });
    };

    const onFinish = async (values: any) => {
        if (!userId) return;
        setSpinning(true);

        const countriesWithTrunkPrefix = countries
            ? countries.filter(country => country.idd?.root).map(country => country.cca2)
            : [];
        const selectedCountryCode = selectedCountry?.dialCode || "+84";
        const shouldKeepZero = countriesKeepZero.includes(selectedCountryCode);
        const formattedPhone = shouldKeepZero
            ? `${selectedCountryCode}${values.phone}`
            : `${selectedCountryCode}${values.phone.replace(/^0+/, "")}`;

        let formattedValues = {
            id: Number(userId),
            username: values.username,
            fullname: values.fullname,
            email: values.email,
            dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : '',
            phone: formattedPhone,
            role: values.role === "admin" ? "ROLE_ADMIN" : "ROLE_SCHOOL_OWNER",
            status: Boolean(values.status),
            ...(selectedRole === 'school_owner' && {
                expectedSchool: values.expectedSchool,
                business_registration_number: values.business_registration_number,
            }),
        };

        const imageFiles = values.image?.map((file: any) => file.originFileObj).filter(Boolean) || [];

        try {
            const response = await updateUser({ data: formattedValues, imageList: imageFiles }).unwrap();
            openNotificationWithIcon('success', 'Success', 'User updated successfully!');
        } catch (error: any) {
            openNotificationWithIcon('error', 'Update Failed', error?.data?.message || 'An error occurred while updating the user.');
        } finally {
            setSpinning(false);
        }
    };

    if (isLoading || isLoadingCountry) {
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
            <MyBreadcrumb
                paths={[
                    { label: "User Management", href: "/admin/management/user/user-detail" },
                    { label: "Edit User" },
                ]}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mx-auto p-6 bg-white rounded-lg h-auto shadow-md"
            >
                <Form
                    {...formItemLayout}
                    form={form}
                    labelCol={{ flex: '150px' }}
                    labelAlign="left"
                    labelWrap
                    onFinish={onFinish}
                    className="space-y-6 mt-5 h-auto"
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={24} md={24} lg={12}>
                            <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={0}>
                                <Form.Item label="User Name" name="username" className={'mb-10'}>
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
                                    className={'mb-10'}
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
                                    className={'mb-10'}
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
                                    className={'mb-10'}
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
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.reject('Date of birth is required!');
                                                if (value.isAfter(dayjs())) return Promise.reject('Date of birth cannot be in the future!');
                                                const age = dayjs().diff(value, 'year');
                                                if (age < 18) return Promise.reject('User must be at least 18 years old!');
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                    className={'mb-10'}
                                >
                                    <DatePicker disabledDate={(current) => current && current > dayjs().endOf('day')} />
                                </Form.Item>
                            </motion.div>

                            {selectedRole === 'school_owner' && (
                                <>
                                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={6}>
                                        <Form.Item
                                            label="Expected School"
                                            name="expectedSchool"
                                            rules={[
                                                { required: true, message: 'Expected school name is required for School Owner!' },
                                                { max: 200, message: 'Expected school name must not exceed 200 characters!' }
                                            ]}
                                            className={'mb-10'}
                                        >
                                            <Input placeholder="Enter the expected school name" />
                                        </Form.Item>
                                    </motion.div>
                                    <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={7}>
                                        <Form.Item
                                            label="BRN"
                                            name="business_registration_number"
                                            rules={[
                                                { required: true, message: 'Business Registration Number is required for School Owner!' },
                                                { min: 10, max: 10, message: 'Business Registration Number must have 10 characters!' }
                                            ]}
                                            className={'mb-10'}
                                        >
                                            <Input placeholder="Enter the Business Registration Number" />
                                        </Form.Item>
                                    </motion.div>
                                </>
                            )}
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={12}>
                            <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={5}>
                                <Form.Item
                                    label="Role"
                                    name="role"
                                    rules={[{ required: true, message: 'Please select a role!' }]}
                                    className={'mb-10'}
                                >
                                    <Select
                                        placeholder="Select a role"
                                        onChange={handleRoleChange}
                                        options={[
                                            { value: 'admin', label: 'Admin' },
                                            { value: 'school_owner', label: 'School Owner' },
                                        ]}
                                    />
                                </Form.Item>
                            </motion.div>

                            <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={selectedRole === 'school_owner' ? 8 : 6}>
                                <Form.Item
                                    label="Status"
                                    name="status"
                                    rules={[{ required: true, message: 'Please choose status!' }]}
                                    className={'mb-10'}
                                >
                                    <Select
                                        placeholder="Select status"
                                        options={[
                                            { value: true, label: 'Active' },
                                            { value: false, label: 'Inactive' },
                                        ]}
                                    />
                                </Form.Item>
                            </motion.div>

                            {selectedRole === 'school_owner' && (
                                <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={7}>
                                    <Form.Item
                                        label="Business license"
                                        name="image"
                                        valuePropName="fileList"
                                        getValueFromEvent={(e) => e?.fileList || []}
                                        rules={[{ required: true, message: 'Business license is required for School Owner!' }]}
                                        className={'mb-10'}
                                    >
                                        <ImageUpload
                                            form={form}
                                            fieldName="image"
                                            maxCount={10}
                                            accept={["image/png", "image/jpg", "image/jpeg"]}
                                            maxSizeMB={5}
                                            hideImageUpload={false}
                                            imageList={form.getFieldValue('image') || []}
                                        />
                                    </Form.Item>
                                </motion.div>
                            )}
                        </Col>
                    </Row>

                    <Row justify="center">
                        <Col>
                            <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" custom={selectedRole === 'school_owner' ? 9 : 7}>
                                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', justifyContent: 'center', gap: '10px' }}>
                                        <Button type="dashed" onClick={() => router.back()}>
                                            Cancel
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={isUpdating}>
                                            Save
                                        </Button>
                                    </div>
                                </Form.Item>
                            </motion.div>
                        </Col>
                    </Row>
                </Form>
            </motion.div>
            <Spin spinning={spinning} fullscreen />
        </>
    );
};

export default EditUser;