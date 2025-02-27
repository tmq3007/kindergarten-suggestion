'use client';

import React, {useEffect, useState} from "react";
import {Breadcrumb, Tabs, Form, Input, DatePicker, Image, Button, Spin, notification, Select} from "antd";
import Link from "next/link";
import {Typography} from "antd";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {useGetParentByIdQuery, useEditParentMutation, useChangePasswordMutation} from '@/redux/services/User/parentApi';
import dayjs from "dayjs";
import {useGetCountriesQuery} from '@/redux/services/registerApi';
import {Country} from "@/redux/services/types";
import {useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery} from '@/redux/services/addressApi';
import {ROLES} from "@/lib/constants";
import {unauthorized} from "next/navigation";

const {Option} = Select;
const {Title} = Typography;
const {TabPane} = Tabs;

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
    const [selectedWard, setSelectedWard] = useState<string | undefined>(undefined); // Thêm trạng thái theo dõi Ward

    const {data: countries, isLoading: isLoadingCountry} = useGetCountriesQuery();
    const {data: provinces, isLoading: isLoadingProvince} = useGetProvincesQuery();
    const {data: districts, isLoading: isLoadingDistrict} = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince,
    });
    const {data: wards, isLoading: isLoadingWard} = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict,
    });

    const {data, isLoading, error: errorParent} = useGetParentByIdQuery(parentIdNumber);

    const [editParent, {isLoading: isEditLoading}] = useEditParentMutation();
    const [form] = Form.useForm();
    const [changePassword, {isLoading: isChangePwdLoading}] = useChangePasswordMutation();
    const [passwordForm] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (data?.data && countries) {
            const phoneNumber = data.data.phone || "";
            const country = countries?.find(c => phoneNumber.startsWith(c.dialCode)) ||
                countries.find(c => c.code === "VN");

            if (country) {
                const countriesKeepZero = [
                    "+39", "+44", "+27", "+353", "+370", "+90", "+240",
                    "+501", "+502", "+503", "+504", "+505", "+506", "+507",
                    "+595", "+598", "+672", "+679", "+685", "+686", "+689"
                ];
                const shouldKeepZero = countriesKeepZero.includes(country.dialCode);

                let phoneWithoutDialCode = phoneNumber.replace(country.dialCode, "").trim();
                if (!shouldKeepZero && !phoneWithoutDialCode.startsWith("0")) {
                    phoneWithoutDialCode = "0" + phoneWithoutDialCode;
                }

                form.setFieldsValue({
                    fullName: data.data.fullName,
                    username: data.data.username,
                    email: data.data.email,
                    phone: phoneWithoutDialCode,
                    dob: data.data.dob ? dayjs(data.data.dob) : null,
                    province: data.data.province,
                    district: data.data.district,
                    ward: data.data.ward,
                    street: data.data.street,
                });

                setSelectedCountry(country);
                setSelectedWard(data.data.ward); // Cập nhật ward đã chọn từ dữ liệu ban đầu
            }
        }
    }, [data, form, countries]);

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        setTimeout(() => {
            api[type]({
                message,
                description,
            });
        }, 0);
    };

    const onFinish1 = async (values: any) => {
        try {
            const selectedProvinceName = provinces?.find(p => p.code === values.province)?.name;
            const selectedDistrictName = districts?.find(d => d.code === values.district)?.name;
            const selectedWardName = wards?.find(w => w.code === values.ward)?.name;
            const countriesKeepZero = [
                "+39", "+44", "+27", "+353", "+370", "+90", "+240",
                "+501", "+502", "+503", "+504", "+505", "+506", "+507",
                "+595", "+598", "+672", "+679", "+685", "+686", "+689"
            ];

            const selectedCountryCode = selectedCountry?.dialCode || "+84";
            const shouldKeepZero = countriesKeepZero.includes(selectedCountryCode);
            const formattedPhone = shouldKeepZero
                ? `${selectedCountryCode}${values.phone}`
                : `${selectedCountryCode}${values.phone.replace(/^0+/, "")}`;

            await editParent({
                parentId,
                data: {
                    ...values,
                    username: username || data?.data?.username,
                    dob: values.dob ? values.dob.format("YYYY-MM-DD") : undefined,
                    province: selectedProvinceName || data?.data?.province,
                    district: selectedDistrictName || data?.data?.district,
                    ward: selectedWardName || data?.data?.ward,
                    street: values.street || data?.data?.street,
                    phone: formattedPhone || data?.data?.phone
                }
            }).unwrap();

            openNotificationWithIcon('success', 'Updated successfully!', 'Your information has been updated');
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            openNotificationWithIcon('error', 'Updated Fail!', 'Your information cannot be updated');
        }
    };

    const onFinish2 = async (values: any) => {
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
            console.error("Lỗi đổi mật khẩu:", error);
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
        form.setFieldsValue({phone: value});
    };

    const onProvinceChange = (provinceCode: number) => {
        form.setFieldsValue({district: undefined, ward: undefined, street: undefined}); // Reset các trường phụ thuộc
        setSelectedProvince(provinceCode);
        setSelectedDistrict(undefined);
        setSelectedWard(undefined); // Reset ward khi tỉnh thay đổi
    };

    const onDistrictChange = (districtCode: number) => {
        form.setFieldsValue({ward: undefined, street: undefined}); // Reset ward và street khi quận thay đổi
        setSelectedDistrict(districtCode);
        setSelectedWard(undefined); // Reset ward khi quận thay đổi
    };

    const onWardChange = (wardCode: string) => {
        setSelectedWard(wardCode); // Cập nhật ward khi người dùng chọn
    };

    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === "VN");
            setSelectedCountry(defaultCountry);
        }
    }, [countries]);

    if (isLoading) return <Spin size="large" className="flex justify-center items-center h-screen"/>;
    if (errorParent) return <p className="text-red-500">Can not load data.</p>;

    return (
        <div className="h-[60%] mt-0 flex flex-col p-9">
            {contextHolder}
            <Breadcrumb
                className={'mt-[50px] mb-0'}
                items={[
                    {title: <Link href="/">Home</Link>},
                    {title: "My Profile"},
                ]}
            />
            <Title level={3} className="my-2">My Profile</Title>
            <div className="flex-grow mb-0 items-center justify-center flex flex-col">
                <Tabs defaultActiveKey="1" type="card" size="small" centered
                      className="flex-grow max-w-[1000px] flex flex-col">
                    <TabPane tab="My Information" key="1">
                        <Form form={form} layout="vertical" onFinish={onFinish1} className="h-full flex flex-col">
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                <div className="flex flex-col">
                                    <Form.Item
                                        rules={[
                                            {required: true, message: 'Full name is required!'},
                                            {
                                                pattern: /^[A-Za-zÀ-ỹ]+(\s+[A-Za-zÀ-ỹ]+)+$/,
                                                message: 'Full name must contain at least two words!'
                                            }
                                        ]}
                                        hasFeedback
                                        name="fullName"
                                        label="Full Name"
                                        className="mb-10"
                                    >
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item
                                        rules={[
                                            {required: true, message: 'Email is required!'},
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
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item
                                        name="province"
                                        label="Province"
                                        className="mb-10"
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
                                        label="District"
                                        className="mb-10"
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
                                <div className="flex flex-col">
                                    <Form.Item
                                        rules={[
                                            {required: true, message: 'Date of birth is required!'},
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
                                        <DatePicker style={{width: "100%"}}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="phone"
                                        label="Phone Number"
                                        className={'mb-10'}
                                        rules={[
                                            {required: true, message: 'Phone number is required!'},
                                            {
                                                pattern: /^\d{4,14}$/,
                                                message: 'Phone number must be between 4 and 14 digits!'
                                            }
                                        ]}
                                    >
                                        <div
                                            className="flex items-center border h-[32px] border-gray-300 rounded-lg overflow-hidden">
                                            <Select
                                                className={'w-2'}
                                                loading={isLoadingCountry}
                                                value={selectedCountry?.code || ''}
                                                onChange={handleCountryChange}
                                                dropdownStyle={{width: 250}}
                                                style={{width: 120, borderRight: "1px #ccc"}}
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
                                                                       preview={false}/>
                                                                {country.code} {country.dialCode}
                                                            </span>
                                                        }
                                                    >
                                                        <div className="flex items-center">
                                                            <Image src={country.flag} alt={country.label} width={20}
                                                                   height={10} className="mr-2 ml-3 intrinsic"/>
                                                            {country.dialCode} - {country.label}
                                                        </div>
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Form.Item
                                                name="phone"
                                                noStyle
                                            >
                                                <Input
                                                    placeholder="Enter your phone number"
                                                    onChange={handlePhoneNumberChange}
                                                    style={{flex: 1, border: "none", boxShadow: "none"}}
                                                />
                                            </Form.Item>
                                        </div>
                                    </Form.Item>
                                    <Form.Item
                                        name="ward"
                                        label="Ward"
                                        className="mb-10"
                                    >
                                        <Select
                                            loading={isLoadingWard}
                                            placeholder="Select ward"
                                            onChange={onWardChange} // Cập nhật trạng thái ward khi thay đổi
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
                                        label="Street"
                                        className="mb-10 h-[33px]"
                                        dependencies={['ward']} // Phụ thuộc vào Ward
                                    >
                                        <Input
                                            disabled={!selectedWard} // Vô hiệu hóa nếu ward chưa được chọn
                                            placeholder={selectedWard ? "Enter street" : "Select ward first"}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                            <Form.Item className="mb-7 mt-3 justify-items-center">
                                <Button loading={isEditLoading} type="primary" htmlType="submit">Save</Button>
                                <Button className="ml-2" htmlType="reset">Cancel</Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="Change Password" key="2">
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={onFinish2}
                            className="h-full flex flex-col w-full"
                        >
                            <div className="flex-grow">
                                <Form.Item
                                    name="oldPassword"
                                    label="Current Password"
                                    rules={[{required: true, message: 'Please enter your current password'}]}
                                >
                                    <Input.Password className="mb-2"/>
                                </Form.Item>
                                <Form.Item
                                    name="newPassword"
                                    label="New Password"
                                    rules={[
                                        {required: true, message: 'Please input your password!'},
                                        {min: 7, message: 'Password must be at least 7 characters!'},
                                        {
                                            pattern: /^(?=.*[A-Za-z])(?=.*\d).{7,}$/,
                                            message: 'Password must include uppercase, lowercase, and a number!'
                                        }
                                    ]}
                                    hasFeedback
                                >
                                    <Input.Password className="mb-2"/>
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    dependencies={['newPassword']}
                                    rules={[
                                        {required: true, message: 'Please confirm your new password'},
                                        ({getFieldValue}) => ({
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
                                    <Input.Password className="mb-2"/>
                                </Form.Item>
                            </div>
                            <Form.Item className="mt-auto justify-items-center">
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
