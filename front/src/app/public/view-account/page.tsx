'use client'
import React, {useEffect, useRef, useState} from 'react';
import { Tabs, Form, Input, DatePicker, Button, notification, Select } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import dayjs from 'dayjs';
import {
    Country,
    useGetCountriesQuery,
} from '@/redux/services/registerApi';
import { ROLES } from '@/lib/constants';
import { unauthorized } from 'next/navigation';
import { ParentUpdateDTO, useChangePasswordMutation, useEditParentMutation, useGetParentByIdQuery } from '@/redux/services/parentApi';
import countriesKeepZero from '@/lib/countriesKeepZero';
import ProfileSidebar from '@/app/components/user/ProfileSideBar';
import UserFormSkeleton from '@/app/components/skeleton/UserFormSkeleton';
import AddressInput from '@/app/components/common/AddressInput';
import PhoneInput from "@/app/components/common/PhoneInput";
import EmailInput from "@/app/components/common/EmailInput";
import {useLazyCheckEmailExceptMeQuery, useLazyCheckPhoneExceptMeQuery} from "@/redux/services/userApi";


const { TabPane } = Tabs;


const Profile = () => {
   const userId = useSelector((state: RootState) => state.user?.id);
   const user = useSelector((state: RootState) => state.user);
   const username = user.username;
   const role = user.role;
   if (!role || role !== ROLES.PARENT) unauthorized();

    const emailInputRef = useRef<any>(null); // Ref to access EmailInput methods
    const phoneInputRef = useRef<any>(null);
   const userIdNumber = Number(userId);
   const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
   const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
   const [processedPhone, setProcessedPhone] = useState<string>('');
    const [triggerCheckEmail] = useLazyCheckEmailExceptMeQuery();
    const [triggerCheckPhone] = useLazyCheckPhoneExceptMeQuery();

   const { data: countries, isLoading: isLoadingCountry } = useGetCountriesQuery();
   const { data: parentData, isLoading, error: errorParent, refetch } = useGetParentByIdQuery(userIdNumber);
   const [editParent, { isLoading: isEditLoading }] = useEditParentMutation();
   const [form] = Form.useForm();
   const [changePassword, { isLoading: isChangePwdLoading }] = useChangePasswordMutation();
   const [passwordForm] = Form.useForm();
   const [api, contextHolder] = notification.useNotification();


   useEffect(() => {
       if (parentData?.data && countries) {
           const phoneNumber = parentData.data.phone || '';
           const country = countries?.find((c) => phoneNumber.startsWith(c.dialCode)) || countries.find((c) => c.code === 'VN');


           if (country) {
               const shouldKeepZero = countriesKeepZero.includes(country.dialCode);
               let phoneWithoutDialCode = phoneNumber.replace(country.dialCode, '').trim();
               if (!shouldKeepZero && !phoneWithoutDialCode.startsWith('0')) phoneWithoutDialCode = '0' + phoneWithoutDialCode;


               setProcessedPhone(phoneWithoutDialCode);
               setSelectedCountry(country);


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
                   media: parentData.data.media,
                   countryCode: country.dialCode,
               });
           }
       }
   }, [parentData, countries, form]);

   const handleCancel = async () => {
       if (parentData?.data && countries) {
           const phoneNumber = parentData.data.phone || '';
           const country = countries?.find((c) => phoneNumber.startsWith(c.dialCode)) || countries.find((c) => c.code === 'VN');

           if (country) {
               const shouldKeepZero = countriesKeepZero.includes(country.dialCode);
               let phoneWithoutDialCode = phoneNumber.replace(country.dialCode, '').trim();
               if (!shouldKeepZero && !phoneWithoutDialCode.startsWith('0')) phoneWithoutDialCode = '0' + phoneWithoutDialCode;


               setProcessedPhone(phoneWithoutDialCode);
               setSelectedCountry(country);


               form.resetFields();
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
                   media: parentData.data.media,
                   countryCode: country.dialCode,
               });

               if (emailInputRef.current) {
                   emailInputRef.current.setEmailStatus('success');
                   emailInputRef.current.setEmailHelp(null);

               }

               if (phoneInputRef.current) {
                   phoneInputRef.current.setPhoneStatus('success');
                   phoneInputRef.current.setPhoneHelp(null);
                   phoneInputRef.current.setSelectedCountry(country);
                }
           }
       }
   }


   const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string) => {
       setTimeout(() => {
           api[type]({ message, description });
       }, 0);
   };


    const changeInformation = async (values: any) => {
        try {
            const isEmailValid = await emailInputRef.current?.validateEmail();
            const isPhoneValid = await phoneInputRef.current?.validatePhone();

            if (!isEmailValid || !isPhoneValid) {
                throw new Error('Validation failed for email or phone');
            }

            const { province, district, ward, street } = values;
            const fullPhoneNumber = phoneInputRef.current?.getFormattedPhoneNumber() || values.phone;

            const newParentData: ParentUpdateDTO = {
                username: username || parentData?.data?.username || '',
                fullname: values.fullname || parentData?.data?.fullname || '',
                role: parentData?.data?.role || '',
                status: parentData?.data?.status ?? false,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : '',
                province: province || null,
                district: district || null,
                ward: ward || null,
                street: street || null,
                phone: fullPhoneNumber,
                email: values.email || parentData?.data?.email || '',
                media: values.media || parentData?.data?.media,
            };

            const imageFile = avatarFile || (values.media instanceof File ? values.media : undefined);

            await editParent({ parentId: userId, data: newParentData, image: imageFile }).unwrap();
            await refetch();
            openNotificationWithIcon('success', 'Updated successfully!', 'Your information has been updated');
        } catch (error) {
            console.error('Error occurred:', error);
            const errorMessage = (error as any)?.data?.message || 'Your information cannot be updated';
            openNotificationWithIcon('error', 'Updated Fail!', errorMessage);
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
       const country = countries?.find((c) => c.code === value);
       if (country) setSelectedCountry(country);
   };


   const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       let value = e.target.value.replace(/\D/g, '');
       form.setFieldsValue({ phone: value });
   };
   const isAdult = (dob: dayjs.Dayjs | null): boolean => {
       if (!dob) return false;
       const today = dayjs();
       const age = today.diff(dob, 'year');
       return age >= 18;
   };


   if (isLoading) return <UserFormSkeleton />;
   if (errorParent) return <p className="text-red-500">Can not load data.</p>;


   return (
       <div className="min-h-screen mt-10 bg-gray-100">
           {contextHolder}
           <div className=" mx-auto mt-10 px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-1">
                   <div className="bg-white rounded-lg shadow-md p-6 h-full">
                       <ProfileSidebar
                           fullname={parentData?.data?.fullname}
                           email={parentData?.data?.email}
                           phone={processedPhone}
                           dob={parentData?.data?.dob}
                           avatarUrl={parentData?.data?.media?.url}
                           onAvatarChange={(file) => setAvatarFile(file)}
                           openNotificationWithIcon={openNotificationWithIcon}
                       />
                   </div>
               </div>
               <div className="h-full my-auto col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-4">
                   <Tabs defaultActiveKey="1" type="card" size="small" className="h-full">
                       <TabPane tab="My Information" key="1" className="p-2">
                           <Form form={form} layout="vertical" onFinish={changeInformation} className="space-y-6 mt-10">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="space-y-6">
                                       <Form.Item
                                           rules={[{ required: true, message: 'Full name is required!' }]}
                                           hasFeedback


                                           name="fullname"
                                           label={<span className="text-black">Full Name</span>}
                                       >
                                           <Input />
                                       </Form.Item>
                                       <EmailInput
                                           form={form}
                                           ref={emailInputRef}
                                           triggerCheckEmail={triggerCheckEmail}
                                           id={userIdNumber}
                                       />
                                       <Form.Item
                                           name="dob"
                                           label={<span className="text-black">Date of Birth</span>}
                                           rules={[
                                               { required: true, message: 'Date of birth is required!' },
                                               {
                                                   validator: (_, value) => {
                                                       if (!isAdult(value)) {
                                                           return Promise.reject(new Error('You must be at least 18 years old!'));
                                                       }
                                                       return Promise.resolve();
                                                   },
                                               },
                                           ]}
                                       >
                                           <DatePicker className="w-full" />
                                       </Form.Item>
                                       <PhoneInput form={form}
                                                   onPhoneChange={(phone) => form.setFieldsValue({ phone })}
                                                   ref={phoneInputRef}
                                                    triggerCheckPhone={triggerCheckPhone}
                                                   id={userIdNumber}
                                       />
                                   </div>
                                   <div className="space-y-6">
                                       <AddressInput
                                           form={form}
                                           onAddressChange={(address) => form.setFieldsValue(address)}
                                       />
                                   </div>
                               </div>
                               <div className="flex justify-center space-x-4">
                                   <Button loading={isEditLoading} type="primary" htmlType="submit">
                                       Save
                                   </Button>
                                   <Button
                                       onClick={async () => {
                                           await handleCancel();
                                       }}
                                   >
                                       Cancel
                                   </Button>
                               </div>
                           </Form>
                       </TabPane>
                       <TabPane tab="Change Password" key="2" className="p-4">
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
                                           message: 'Password must contain at least one letter, and one number!'
                                       }
                                   ]}
                                   hasFeedback
                               >
                                   <Input.Password className="w-full" />
                               </Form.Item>
                               <Form.Item
                                   name="confirmPassword"
                                   label={<span className="text-black">Confirm New Password</span>}
                                   dependencies={['newPassword']}
                                   hasFeedback
                                   rules={[
                                       {
                                           required: true,
                                           message: 'Please confirm your password!',
                                       },
                                       ({ getFieldValue }) => ({
                                           validator(_, value) {
                                               if (!value || getFieldValue('newPassword') === value) {
                                                   return Promise.resolve();
                                               }
                                               return Promise.reject(new Error('The new password that you entered do not match!'));
                                           },
                                       }),
                                   ]}
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
   );
};


export default Profile;