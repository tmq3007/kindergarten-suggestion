'use client';

import React, { useEffect, useState } from 'react';
import {
    Tabs,
    Form,
    Input,
    DatePicker,
    Button,
    Spin,
    notification,
    Select,
} from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import dayjs from 'dayjs';
import { useGetCountriesQuery } from '@/redux/services/registerApi';
import { Country } from '@/redux/services/types';
import { useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery } from '@/redux/services/addressApi';
import { ROLES } from '@/lib/constants';
import { unauthorized } from 'next/navigation';
import { useChangePasswordMutation, useEditParentMutation, useGetParentByIdQuery } from '@/redux/services/parentApi';
import countriesKeepZero from '@/lib/countriesKeepZero';
import FormSkeleton from '@/app/components/FormSkeleton';
import ProfileSidebar from "@/app/public/view-account/ProfileSideBar";

const { Option } = Select;
const { TabPane } = Tabs;

const Profile = () => {
    const userId = useSelector((state: RootState) => state.user?.id);
    const user = useSelector((state: RootState) => state.user);
    const username = user.username;
    const role = user.role;
    if (!role || role !== ROLES.PARENT) {
        unauthorized();
    }
    const userIdNumber = Number(userId);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
    const [selectedWard, setSelectedWard] = useState<string | undefined>();

    const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();
    const { data: provinces, isLoading: isLoadingProvince } = useGetProvincesQuery();
    const { data: districts, isLoading: isLoadingDistrict } = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince,
    });
    const { data: wards, isLoading: isLoadingWard } = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict,
    });

    const { data: parentData, isLoading, error: errorParent } = useGetParentByIdQuery(userIdNumber);

    const [editParent, { isLoading: isEditLoading }] = useEditParentMutation();
    const [form] = Form.useForm();
    const [changePassword, { isLoading: isChangePwdLoading }] = useChangePasswordMutation();
    const [passwordForm] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (parentData?.data && countries) {
            const phoneNumber = parentData.data.phone || '';
            const country = countries?.find(c => phoneNumber.startsWith(c.dialCode)) ||
                countries.find(c => c.code === 'VN');

            if (country) {
                const shouldKeepZero = countriesKeepZero.includes(country.dialCode);
                let phoneWithoutDialCode = phoneNumber.replace(country.dialCode, '').trim();
                if (!shouldKeepZero && !phoneWithoutDialCode.startsWith('0')) {
                    phoneWithoutDialCode = '0' + phoneWithoutDialCode;
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
    }, [parentData, form, countries, provinces, districts]);

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

            const selectedCountryCode = selectedCountry?.dialCode || '+84';
            const shouldKeepZero = countriesKeepZero.includes(selectedCountryCode);
            const formattedPhone = shouldKeepZero
                ? `${selectedCountryCode}${values.phone}`
                : `${selectedCountryCode}${values.phone.replace(/^0+/, '')}`;

            await editParent({
                parentId: userId,
                data: {
                    ...values,
                    username: username || parentData?.data?.username,
                    role: parentData?.data?.role,
                    status: parentData?.data?.status,
                    dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
                    province: selectedProvinceName || parentData?.data?.province,
                    district: selectedDistrictName || parentData?.data?.district,
                    ward: selectedWardName || parentData?.data?.ward,
                    street: values.street || parentData?.data?.street,
                    phone: formattedPhone || parentData?.data?.phone,
                    email: values.email || parentData?.data?.phone,
                },
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
                parentId: userIdNumber,
                data: {
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword,
                },
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
        let value = e.target.value.replace(/\D/g, '');
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
            const defaultCountry = countries.find((c) => c.code === 'VN');
            setSelectedCountry(defaultCountry);
        }
    }, [countries]);

    if (isLoading) return <UserFormSkeleton/>;
    if (errorParent) return <p className="text-red-500">Can not load data.</p>;

    const transparentTabStyle = {
       // backgroundColor: '#ffffff',
        border: 'none !important',
    };

    return (
        <div className="min-h-screen mt-14 bg-white">
            {contextHolder}
            <div className="container mx-auto mt-10 px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar Column */}
                    <div className="col-span-1 ">
                        <div className="bg-blue-50 rounded-lg shadow-md p-6 h-full">
                            <ProfileSidebar
                                fullname={parentData?.data?.fullname}
                                email={parentData?.data?.email}
                                phone={parentData?.data?.phone}
                                dob={parentData?.data?.dob}
                            />
                        </div>
                    </div>

                    {/* Main Content Column */}
                    <div className="col-span-1 md:col-span-2  ">
                        <div className="bg-blue-50 rounded-lg shadow-md p-4 h-full">
                            <Tabs
                                defaultActiveKey="1"
                                type="card"
                                size="small"
                                className="h-full bg-blue-50"
                                tabBarStyle={{
                                    marginBottom: 0,
                                   // backgroundColor: '#f0f2f5',
                                    color: '#555',
                                }}
                            >
                                <TabPane
                                    tab="My Information"
                                    key="1"
                                    className="p-2 bg-blue-50"
                                    style={transparentTabStyle}
                                >
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={changeInformation}
                                        className="space-y-6 mt-12"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <Form.Item
                                                    rules={[
                                                        { required: true, message: 'Full name is required!' },
                                                        {
                                                            pattern: /^[A-Za-zÀ-ỹ]+(\s+[A-Za-zÀ-ỹ]+)+$/,
                                                            message: 'Full name must contain at least two words!',
                                                        },
                                                    ]}
                                                    hasFeedback
                                                    name="fullname"
                                                    label={<span className="text-black">Full Name</span>}
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    rules={[
                                                        { required: true, message: 'Email is required!' },
                                                        {
                                                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: 'Enter a valid email address!',
                                                        },
                                                    ]}
                                                    hasFeedback
                                                    name="email"
                                                    label={<span className="text-black">Email Address</span>}
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    name="province"
                                                    label={<span className="text-black">&nbsp;Province</span>}
                                                >
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
                                                <Form.Item
                                                    name="district"
                                                    label={<span className="text-black">&nbsp;District</span>}
                                                >
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
                                            <div className="space-y-6">
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
                                                            },
                                                        },
                                                    ]}
                                                    name="dob"
                                                    label={<span className="text-black">Date of Birth</span>}
                                                >
                                                    <DatePicker className="w-full" />
                                                </Form.Item>
                                                <Form.Item
                                                    name="phone"
                                                    label={<span className="text-black">Phone Number</span>}
                                                    rules={[
                                                        { required: true, message: 'Phone number is required!' },
                                                        {
                                                            pattern: /^\d{4,14}$/,
                                                            message: 'Phone number must be between 4 and 14 digits!',
                                                        },
                                                    ]}
                                                >
                                                    <div className="flex items-center border h-8 border-gray-300 rounded-lg overflow-hidden">
                                                        <Select
                                                            className="w-2"
                                                            loading={isLoadingCountry}
                                                            value={selectedCountry?.code || ''}
                                                            onChange={handleCountryChange}
                                                            dropdownStyle={{ width: 250 }}
                                                            style={{ width: 120, borderRight: '1px #ccc' }}
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
                                                                            <img src={country.flag} alt={country.label} width={20} height={10} className="mr-3" />
                                                                            {country.code} {country.dialCode}
                                                                        </span>
                                                                    }
                                                                >
                                                                    <div className="flex items-center">
                                                                        <img src={country.flag} alt={country.label} width={20} height={10} className="mr-2 ml-3" />
                                                                        {country.dialCode} - {country.label}
                                                                    </div>
                                                                </Select.Option>
                                                            ))}
                                                        </Select>
                                                        <Form.Item name="phone" noStyle>
                                                            <Input
                                                                placeholder="Enter your phone number"
                                                                onChange={handlePhoneNumberChange}
                                                                style={{ flex: 1, border: 'none', boxShadow: 'none' }}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </Form.Item>
                                                <Form.Item
                                                    name="ward"
                                                    label={<span className="text-black">&nbsp;Ward</span>}
                                                >
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
                                                <Form.Item
                                                    name="street"
                                                    label={<span className="text-black">&nbsp;Street</span>}
                                                    dependencies={['province', 'district', 'ward']}
                                                >
                                                    <Input
                                                        disabled={!selectedProvince || !selectedDistrict || !selectedWard}
                                                        placeholder={
                                                            !selectedProvince
                                                                ? 'Select province first'
                                                                : !selectedDistrict
                                                                    ? 'Select district first'
                                                                    : !selectedWard
                                                                        ? 'Select ward first'
                                                                        : 'Enter street'
                                                        }
                                                    />
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div className="flex justify-center space-x-4">
                                            <Button loading={isEditLoading} type="primary" htmlType="submit">
                                                Save
                                            </Button>
                                            <Button htmlType="reset">
                                                Cancel
                                            </Button>
                                        </div>
                                    </Form>
                                </TabPane>
                                <TabPane
                                    tab="Change Password"
                                    key="2"
                                    className="p-4"
                                    style={transparentTabStyle}
                                >
                                    <Form
                                        form={passwordForm}
                                        layout="vertical"
                                        onFinish={changePwd}
                                        className="max-w-md mx-auto space-y-6 mt-12"
                                    >
                                        <Form.Item
                                            name="oldPassword"
                                            label={<span className="text-black">Current Password</span>}
                                            rules={[{ required: true, message: 'Please enter your current password' }]}
                                        >
                                            <Input.Password className="w-full" />
                                        </Form.Item>
                                        <Form.Item
                                            name="newPassword"
                                            label={<span className="text-black">New Password</span>}
                                            rules={[
                                                { required: true, message: 'Please input your password!' },
                                                { min: 7, message: 'Password must be at least 7 characters!' },
                                                {
                                                    pattern: /^(?=.*[A-Za-z])(?=.*\d).{7,}$/,
                                                    message: 'Password must include uppercase, lowercase, and a number!',
                                                },
                                            ]}
                                            hasFeedback
                                        >
                                            <Input.Password className="w-full" />
                                        </Form.Item>
                                        <Form.Item
                                            name="confirmPassword"
                                            label={<span className="text-black">Confirm New Password</span>}
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
                                            <Input.Password className="w-full" />
                                        </Form.Item>
                                        <div className="flex justify-center">
                                            <Button loading={isChangePwdLoading} type="primary" htmlType="submit">
                                                Change Password
                                            </Button>
                                        </div>
                                    </Form>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;