'use client';

import React, {useEffect, useState} from "react";
import {Breadcrumb, Tabs, Form, Input, DatePicker, Image, Button, Spin, notification, Select} from "antd";
import Link from "next/link";
import {Typography} from "antd";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {useGetParentByIdQuery, useEditParentMutation, useChangePasswordMutation} from '@/redux/services/User/parentApi';
import dayjs from "dayjs";
import {Country, useGetCountriesQuery} from '@/redux/services/registerApi';
import {
    useGetProvincesQuery,
    useGetDistrictsQuery,
    useGetWardsQuery,
    Province,
    District,
    Ward
} from '@/redux/services/addressApi';
import {unauthorized, useRouter} from "next/navigation";

const {Option} = Select;
const {Title} = Typography;
const {TabPane} = Tabs;
const Profile = () => {
    const router = useRouter();
    const parentId = useSelector((state: RootState) => state.user?.id);
    const username = useSelector((state: RootState) => state.user?.username);
    const parentIdNumber = Number(parentId);

    if (!username) {
        unauthorized();
    }

    //  console.log("country", countries);

    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();

    const {data: countries, isLoading: isLoadingCountry} = useGetCountriesQuery();
    const {data: provinces, isLoading: isLoadingProvince} = useGetProvincesQuery();
    const {data: districts, isLoading: isLoadingDistrict} = useGetDistrictsQuery(selectedProvince!, {
        skip: !selectedProvince,
    });
    const {data: wards, isLoading: isLoadingWard} = useGetWardsQuery(selectedDistrict!, {
        skip: !selectedDistrict,
    });

    const {data, isLoading, error: errorParent} = useGetParentByIdQuery(parentIdNumber);

    const [editParent] = useEditParentMutation();
    const [form] = Form.useForm();
    const [changePassword] = useChangePasswordMutation();
    const [passwordForm] = Form.useForm();
    // Khai báo notification ở ngoài render
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (data?.data) {
            form.setFieldsValue({
                fullName: data.data.fullName,
                username: data.data.username,
                email: data.data.email,
                phone: data.data.phone,
                dob: data.data.dob ? dayjs(data.data.dob) : null,
                province: data.data.province,
                district: data.data.district,
                ward: data.data.ward,
                street: data.data.street,
            });
        }
    }, [data, form]);

    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
        // Đặt thông báo trong useEffect để tránh lỗi
        setTimeout(() => {
            api[type]({
                message,
                description,
            });
        }, 0);
    };

    const onFinish1 = async (values: any) => {
        try {
            // Tìm name của province, district, ward từ danh sách
            const selectedProvinceName = provinces?.find(p => p.code === values.province)?.name;
            const selectedDistrictName = districts?.find(d => d.code === values.district)?.name;
            const selectedWardName = wards?.find(w => w.code === values.ward)?.name;
            const countriesKeepZero = [
                "+39", "+44", "+27", "+353", "+370", "+90", "+240",
                "+501", "+502", "+503", "+504", "+505", "+506", "+507",
                "+595", "+598", "+672", "+679", "+685", "+686", "+689"
            ];

            const selectedCountryCode = selectedCountry?.dialCode || "+84"; // Mặc định là VN

            const shouldKeepZero = countriesKeepZero.includes(selectedCountryCode);

            // Nếu quốc gia giữ số 0 -> Giữ nguyên, ngược lại loại bỏ số 0 đầu
            const formattedPhone = shouldKeepZero
                ? `${selectedCountryCode}${values.phone}`
                : `${selectedCountryCode}${values.phone.replace(/^0+/, "")}`;
            await editParent({
                parentId,
                data: {
                    ...values,
                    username: username || data?.data?.username,
                    dob: values.dob ? values.dob.format("YYYY-MM-DD") : undefined,
                    province: selectedProvinceName || data?.data?.province, // Lưu theo name
                    district: selectedDistrictName || data?.data?.district, // Lưu theo name
                    ward: selectedWardName || data?.data?.ward, // Lưu theo name
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

    // handle doi quoc gia
    const handleCountryChange = (value: string) => {
        if (countries) {
            const country = countries.find((c) => c.code === value);
            if (country) {
                setSelectedCountry(country);
            }
        }
    };

    // Xu ly thay doi so dien thoai
    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
    };
    const onProvinceChange = (provinceCode: number) => {
        form.setFieldsValue({district: undefined, ward: undefined}); // Reset district và ward
        setSelectedProvince(provinceCode);
        setSelectedDistrict(undefined); // Hoặc setSelectedDistrict(null);
    };
    // Chon quoc gia mac dinh la VN
    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === "VN");
            setSelectedCountry(defaultCountry);
        }
    }, [countries])
    useEffect(() => {
        if (data?.data) {
            // Tách mã vùng từ số điện thoại
            const phoneNumber = data.data.phone || "";
            const country = countries?.find(c => phoneNumber.startsWith(c.dialCode));

            form.setFieldsValue({
                fullName: data.data.fullName,
                username: data.data.username,
                email: data.data.email,
                phone: phoneNumber.replace(country?.dialCode || "+84", "").trim(), // Loại bỏ mã vùng
                dob: data.data.dob ? dayjs(data.data.dob) : null,
                province: data.data.province,
                district: data.data.district,
                ward: data.data.ward,
                street: data.data.street,
            });

            // Cập nhật country đã chọn
            if (country) {
                setSelectedCountry(country);
            }
        }
    }, [data, form, countries]);


    if (isLoading) return <Spin size="large" className="flex justify-center items-center h-screen"/>;

    interface Province {
        code: string;
        name: string;
    }

    return (
        <div className="h-[60%] mt-0 flex flex-col p-9">
            {contextHolder} {/* Thêm phần này để hiển thị notification */}

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
                      className="flex-grow max-w-[1000px]   flex flex-col">
                    <TabPane tab="My Information" key="1">
                        <Form form={form} layout="vertical" onFinish={onFinish1} className="h-full flex flex-col">
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                <div className="flex flex-col">
                                    <Form.Item rules={[
                                        {required: true, message: 'Full name is required!'},
                                        {
                                            pattern: /^[A-Za-zÀ-ỹ]+(\s+[A-Za-zÀ-ỹ]+)+$/,
                                            message: 'Full name must contain at least two words!'
                                        }
                                    ]}
                                               hasFeedback name="fullName" label="Full Name" className="mb-10">
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item rules={[
                                        {required: true, message: 'Email is required!'},
                                        {
                                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Enter a valid email address!'
                                        },
                                        // { type: 'email', message: 'Enter a valid email address!' }
                                    ]}
                                               hasFeedback name="email" label="Email Address" className="mb-10">
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item name="province" label="Province">
                                        <Select onChange={onProvinceChange} placeholder="Select a province">
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
                                            onChange={(value) => setSelectedDistrict(Number(value))}
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
                                    <Form.Item rules={[
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
                                    ]} name="dob" label="Date of Birth" className="mb-10">
                                        <DatePicker style={{width: "100%"}}/>
                                    </Form.Item>
                                    <Form.Item name="phone"
                                               label="Phone Number" className={'mb-10'}
                                               rules={[
                                                   {required: true, message: 'Phone number is required!'},
                                                   {pattern: /^\d{4,14}$/, message: 'Phone is wrong'}
                                               ]}>
                                        <div
                                            className="flex items-center border h-[32px] border-gray-300 rounded-lg overflow-hidden">
                                            {/* Country Code Selector */}
                                            <Select
                                                className={'w-2'}
                                                loading={isLoadingCountry}
                                                value={selectedCountry?.code || ''}
                                                onChange={handleCountryChange}
                                                dropdownStyle={{width: 250}}
                                                style={{width: 120, borderRight: "1px  #ccc"}}
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
                                            <Image src={country.flag}
                                                   alt={country.label}
                                                   width={20} height={10}
                                                   className="mr-2 intrinsic" preview={false}/>
                                                                {country.code} {country.dialCode}
                                        </span>
                                                        }
                                                    >
                                                        <div className="flex items-center ">
                                                            <Image src={country.flag}
                                                                   alt={country.label}
                                                                   width={10} height={10}
                                                                   className="mr-2 ml-3 intrinsic"/>
                                                            &nbsp; &nbsp; {country.dialCode} - {country.label}
                                                        </div>
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Form.Item
                                                name="phone"
                                                noStyle
                                            >
                                                {/* Phone Number Input */}
                                                <Input
                                                    //addonBefore={selectedCountry?.dialCode || "+84"}
                                                    placeholder="Enter your phone number"
                                                    onChange={handlePhoneNumberChange}
                                                    style={{flex: 1, border: "none", boxShadow: "none"}}
                                                />
                                            </Form.Item>
                                        </div>
                                    </Form.Item>
                                    <Form.Item name="ward" label="Ward" className="mb-6">
                                        <Select
                                            loading={isLoadingWard}
                                            placeholder="Select ward"
                                            disabled={!selectedDistrict}
                                        >
                                            {wards?.map((ward) => (
                                                <Option key={ward.code} value={ward.code}>
                                                    {ward.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="street" label="Street" className="mb-10 h-[33px]">
                                        <Input/>
                                    </Form.Item>
                                </div>
                            </div>
                            <Form.Item className="mb-7 mt-3 justify-items-center">
                                <Button type="primary" htmlType="submit">Save</Button>
                                <Button className="ml-2" htmlType="reset">Cancel</Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    {/*Password Tab*/}

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
                                    <Input.Password className="mb-10"/>
                                </Form.Item>
                                <Form.Item
                                    name="newPassword"
                                    label="New Password"
                                    rules={[
                                        {required: true, message: 'Please input your password!'},
                                        {min: 8, message: 'Password must be at least 8 characters!'},
                                        {
                                            pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message: 'Password must include uppercase, ' +
                                                'lowercase, and a number!'
                                        }
                                    ]} hasFeedback
                                >
                                    <Input.Password className="mb-10"/>
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
                                    ]} hasFeedback
                                >
                                    <Input.Password className="mb-10"/>
                                </Form.Item>
                            </div>
                            <Form.Item className=" mt-auto justify-items-center">
                                <Button type="primary" htmlType="submit">Change Password</Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                </Tabs>
            </div>
        </div>
    );
};

export default Profile;
