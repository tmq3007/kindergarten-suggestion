'use client';

import React, { useEffect, useState } from "react";
import {Breadcrumb, Tabs, Form, Input, DatePicker, Image, Button, Spin, notification, Select, Skeleton} from "antd";
import Link from "next/link";
import { Typography } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import dayjs from "dayjs";
import { useGetCountriesQuery } from '@/redux/services/registerApi';
import { Country } from "@/redux/services/types";
import { useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery } from '@/redux/services/addressApi';
import { ROLES } from "@/lib/constants";
import { unauthorized } from "next/navigation";
import { useChangePasswordMutation, useEditParentMutation, useGetParentByIdQuery } from "@/redux/services/parentApi";
import countriesKeepZero from "@/lib/countriesKeepZero";
import FormSkeleton from "@/app/components/FormSkeleton";

const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
    const parentId = useSelector((state: RootState) => state.user?.id);
    const user = useSelector((state: RootState) => state.user);
    const username = user.username;
    const role = user.role;
    if (!role || role !== ROLES.PARENT) {
        unauthorized();
    }
    const parentIdNumber = Number(parentId);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
    const [selectedWard, setSelectedWard] = useState<string | undefined>(undefined);

    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();
    const { data: provinces, isLoading: isLoadingProvince } = useGetProvincesQuery();
    const { data: districts, isLoading: isLoadingDistrict } = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince,
    });
    const { data: wards, isLoading: isLoadingWard } = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict,
    });

    const { data: parentData, isLoading, error: errorParent } = useGetParentByIdQuery(parentIdNumber);

    const [editParent, { isLoading: isEditLoading }] = useEditParentMutation();
    const [form] = Form.useForm();
    const [changePassword, { isLoading: isChangePwdLoading }] = useChangePasswordMutation();
    const [passwordForm] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (parentData?.data && countries) {
            const phoneNumber = parentData.data.phone || "";
            const country = countries?.find(c => phoneNumber.startsWith(c.dialCode)) ||
                countries.find(c => c.code === "VN");

            if (country) {
                const shouldKeepZero = countriesKeepZero.includes(country.dialCode);
                let phoneWithoutDialCode = phoneNumber.replace(country.dialCode, "").trim();
                if (!shouldKeepZero && !phoneWithoutDialCode.startsWith("0")) {
                    phoneWithoutDialCode = "0" + phoneWithoutDialCode;
                }

                form.setFieldsValue({
                    fullname: parentData.data.fullname,
                    username: parentData.data.username,
                    email: parentData.data.email,
                    phone: phoneWithoutDialCode,
                    dob: parentData.data.dob ? dayjs(parentData.data.dob) : null,
                    province: parentData.data.province,
                    district: parentData.data.district,
                    ward: parentData.data.ward,
                    street: parentData.data.street,
                });

                const provinceCode = provinces?.find(p => p.name === parentData.data.province)?.code;
                const districtCode = districts?.find(d => d.name === parentData.data.district)?.code;

                setSelectedCountry(country);
                setSelectedProvince(provinceCode);
                setSelectedDistrict(districtCode);
                setSelectedWard(parentData.data.ward);
            }
        }
    }, [parentData, form, countries]);

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        setTimeout(() => {
            api[type]({
                message,
                description,
            });
        }, 0);
    };

    const changeInformation = async (values: any) => {
        try {
            const selectedProvinceName = provinces?.find(p => p.code === values.province)?.name;
            const selectedDistrictName = districts?.find(d => d.code === values.district)?.name;
            const selectedWardName = wards?.find(w => w.code === values.ward)?.name;

            const selectedCountryCode = selectedCountry?.dialCode || "+84";
            const shouldKeepZero = countriesKeepZero.includes(selectedCountryCode);
            const formattedPhone = shouldKeepZero
                ? `${selectedCountryCode}${values.phone}`
                : `${selectedCountryCode}${values.phone.replace(/^0+/, "")}`;

            await editParent({
                parentId,
                data: {
                    ...values,
                    username: username || parentData?.data?.username,
                    role: parentData?.data?.role,
                    status: parentData?.data?.status,
                    dob: values.dob ? values.dob.format("YYYY-MM-DD") : undefined,
                    province: selectedProvinceName || parentData?.data?.province,
                    district: selectedDistrictName || parentData?.data?.district,
                    ward: selectedWardName || parentData?.data?.ward,
                    street: values.street || parentData?.data?.street,
                    phone: formattedPhone || parentData?.data?.phone,
                    email: values.email || parentData?.data?.phone,
                }
            }).unwrap();
            openNotificationWithIcon('success', 'Updated successfully!', 'Your information has been updated');
        } catch (error) {
            openNotificationWithIcon('error', 'Updated Fail!', 'Your information cannot be updated');
        }
    };

    const changePwd = async (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            openNotificationWithIcon('error', 'Failed!', 'New password and confirm password do not match.');
            return;
        }

        try {
            await changePassword({
                parentId: parentIdNumber,
                data: {
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword,
                }
            }).unwrap();

            openNotificationWithIcon('success', 'Success!', 'Password changed successfully');
            passwordForm.resetFields();
        } catch (error) {
            openNotificationWithIcon('error', 'Failed!', 'Current password is incorrect or request failed.');
        }
    };

    const handleCountryChange = (value: string) => {
        if (countries) {
            const country = countries.find((c) => c.code === value);
            if (country) {
                setSelectedCountry(country);
            }
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        form.setFieldsValue({ phone: value });
    };

    const onProvinceChange = (provinceCode: number) => {
        form.setFieldsValue({ district: undefined, ward: undefined, street: undefined });
        setSelectedProvince(provinceCode);
        setSelectedDistrict(undefined);
        setSelectedWard(undefined);
    };

    const onDistrictChange = (districtCode: number) => {
        form.setFieldsValue({ ward: undefined, street: undefined });
        setSelectedDistrict(districtCode);
        setSelectedWard(undefined);
    };

    const onWardChange = (wardCode: string) => {
        setSelectedWard(wardCode);
    };

    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === "VN");
            setSelectedCountry(defaultCountry);
        }
    }, [countries]);

    // if (isLoading) return <Spin size="large" className="flex justify-center items-center h-screen" />;
   if (isLoading) return <FormSkeleton/>;
    if (errorParent) return <p className="text-red-500">Can not load data.</p>;

    return (
        <div className="relative min-h-screen flex flex-col p-7">
            {contextHolder}
            <Breadcrumb
                className="mt-[50px] mb-0"
                items={[
                    { title: <Link href="/">Home</Link> },
                    { title: "My Profile" },
                ]}
            />
            <Title level={3} className="my-2">My Profile</Title>
            <div className="flex-grow flex items-center justify-center">
                <Tabs
                    defaultActiveKey="1"
                    type="card"
                    size="small"
                    centered
                    className="w-[1000px] h-[600px] flex flex-col" // Fixed width and height
                    tabBarStyle={{
                        marginBottom: 0,

                    }}
                >
                    <TabPane tab="My Information" key="1" className="h-full">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={changeInformation}
                            className="h-full flex flex-col p-4 overflow-auto" // Add padding and scroll if needed
                        >
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                <div className="flex flex-col">
                                    <Form.Item
                                        rules={[
                                            { required: true, message: 'Full name is required!' },
                                            {
                                                pattern: /^[A-Za-zÀ-ỹ]+(\s+[A-Za-zÀ-ỹ]+)+$/,
                                                message: 'Full name must contain at least two words!'
                                            }
                                        ]}
                                        hasFeedback
                                        name="fullname"
                                        label="Full Name"
                                        className="mb-10"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        rules={[
                                            { required: true, message: 'Email is required!' },
                                            {
                                                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Enter a valid email address!'
                                            },
                                        ]}
                                        hasFeedback
                                        name="email"
                                        label="Email Address"
                                        className="mb-10"
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="province" label="Province" className="mb-10">
                                        <Select
                                            onChange={onProvinceChange}
                                            placeholder="Select a province"
                                            loading={isLoadingProvince}
                                        >
                                            {provinces?.map(province => (
                                                <Select.Option key={province.code} value={province.code}>
                                                    {province.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="district" label="District" className="mb-10">
                                        <Select
                                            loading={isLoadingDistrict}
                                            placeholder="Select district"
                                            onChange={onDistrictChange}
                                            disabled={!selectedProvince}
                                        >
                                            {districts?.map((district) => (
                                                <Option key={district.code} value={district.code}>
                                                    {district.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="flex flex-col">
                                    <Form.Item
                                        rules={[
                                            { required: true, message: 'Date of birth is required!' },
                                            {
                                                validator: (_, value) => {
                                                    if (!value) return Promise.reject('Date of birth is required!');
                                                    if (value.isAfter(dayjs())) {
                                                        return Promise.reject('Date of birth cannot be in the future!');
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                        name="dob"
                                        label="Date of Birth"
                                        className="mb-10"
                                    >
                                        <DatePicker style={{ width: "100%" }} />
                                    </Form.Item>
                                    <Form.Item
                                        name="phone"
                                        label="Phone Number"
                                        className="mb-10"
                                        rules={[
                                            { required: true, message: 'Phone number is required!' },
                                            {
                                                pattern: /^\d{4,14}$/,
                                                message: 'Phone number must be between 4 and 14 digits!'
                                            }
                                        ]}
                                    >
                                        <div className="flex items-center border h-[32px] border-gray-300 rounded-lg overflow-hidden">
                                            <Select
                                                className="w-2"
                                                loading={isLoadingCountry}
                                                value={selectedCountry?.code || ''}
                                                onChange={handleCountryChange}
                                                dropdownStyle={{ width: 250 }}
                                                style={{ width: 120, borderRight: "1px #ccc" }}
                                                optionLabelProp="label2"
                                                showSearch={false}
                                                filterOption={(input, option) =>
                                                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {countries?.map((country) => (
                                                    <Select.Option
                                                        key={country.code}
                                                        value={country.code}
                                                        label={country.label}
                                                        label2={
                                                            <span className="flex items-center">
                                                                <Image src={country.flag} alt={country.label} width={20}
                                                                       height={10} className="mr-3 intrinsic"
                                                                       preview={false} />
                                                                {country.code} {country.dialCode}
                                                            </span>
                                                        }
                                                    >
                                                        <div className="flex items-center">
                                                            <Image src={country.flag} alt={country.label} width={20}
                                                                   height={10} className="mr-2 ml-3 intrinsic" />
                                                            {country.dialCode} - {country.label}
                                                        </div>
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Form.Item name="phone" noStyle>
                                                <Input
                                                    placeholder="Enter your phone number"
                                                    onChange={handlePhoneNumberChange}
                                                    style={{ flex: 1, border: "none", boxShadow: "none" }}
                                                />
                                            </Form.Item>
                                        </div>
                                    </Form.Item>
                                    <Form.Item name="ward" label="Ward" className="mb-10">
                                        <Select
                                            loading={isLoadingWard}
                                            placeholder="Select ward"
                                            onChange={onWardChange}
                                            disabled={!selectedDistrict}
                                        >
                                            {wards?.map((ward) => (
                                                <Option key={ward.code} value={ward.code}>
                                                    {ward.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="street" label="Street" className="mb-10 h-[33px]" dependencies={['ward']}>
                                        <Input
                                            disabled={!selectedWard}
                                            placeholder={selectedWard ? "Enter street" : "Select ward first"}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                            <Form.Item className="mb-7 mt-3 flex justify-center">
                                <Button loading={isEditLoading} type="primary" htmlType="submit">Save</Button>
                                <Button className="ml-2" htmlType="reset">Cancel</Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="Change Password" key="2" className="h-full">
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={changePwd}
                            className="h-full flex flex-col p-4 w-full overflow-auto" // Add padding and scroll if needed
                        >
                            <div className="flex-grow">
                                <Form.Item
                                    name="oldPassword"
                                    label="Current Password"
                                    rules={[{ required: true, message: 'Please enter your current password' }]}
                                >
                                    <Input.Password className="mb-2" />
                                </Form.Item>
                                <Form.Item
                                    name="newPassword"
                                    label="New Password"
                                    rules={[
                                        { required: true, message: 'Please input your password!' },
                                        { min: 7, message: 'Password must be at least 7 characters!' },
                                        {
                                            pattern: /^(?=.*[A-Za-z])(?=.*\d).{7,}$/,
                                            message: 'Password must include uppercase, lowercase, and a number!'
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <Input.Password className="mb-2" />
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Please confirm your new password' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Passwords do not match!'));
                                            },
                                        }),
                                    ]}
                                    hasFeedback
                                >
                                    <Input.Password className="mb-2" />
                                </Form.Item>
                            </div>
                            <Form.Item className="mt-auto flex justify-center">
                                <Button loading={isChangePwdLoading} type="primary" htmlType="submit">Change Password</Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default Profile;