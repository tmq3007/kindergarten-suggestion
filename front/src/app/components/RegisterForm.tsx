import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Image, Input, message, Select } from 'antd';
import Link from "next/link";
import {useLazyCheckEmailQuery, useRegisterMutation } from '@/redux/services/registerApi';
import { Country } from '@/redux/services/types';

interface FieldType {
    fullname: string;
    email: string;
    phone?: string;
    password: string;
    confirm: string;
    termAndCon: boolean;
}
interface RegisterFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    countries?: Country[];
    isLoadingCountry: boolean
}

export default function RegisterForm({onSuccess, onCancel,countries,isLoadingCountry }: RegisterFormProps) {
    const [form] = Form.useForm();

    const [formValues, setFormValues] = useState<Partial<FieldType>>({ termAndCon: false });
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    const [messageApi, contextHolder] = message.useMessage();
    const [register, { data: registerData, isLoading: isRegistering, error: registerError }] = useRegisterMutation();

    // Set default country to VN 
    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === "VN");
            setSelectedCountry(defaultCountry);
        }
    }, [countries])

    useEffect(() => {
        // Handle successful registration
        if (registerData?.code === 201) {
            messageApi.success("Register successfully! Redirecting to login page...");
            setFormValues({});
            setTimeout(() => {
                onSuccess();
            }, 2500);
        }
        // Handle registration error
        if (registerError) {
            messageApi.error("Register failed!");
        }
    }, [registerData, registerError])

    // Handle country selection change
    const handleCountryChange = (value: string) => {
        if (countries) {
            const country = countries.find((c) => c.code === value);
            if (country) {
                setSelectedCountry(country);
            }
        }
    };

    // Handle phone number input change (remove non-numeric characters)
    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        e.target.value = value;  // Add sanitized value back to input
    };

    // Handle form submission
    const onFinish = (values: FieldType) => {
        const countriesWithTrunkPrefix = ["VN", "GB", "IN", "JP", "ID", "DE", "IT", "AU", "ZA"];
        let formattedPhone = values.phone || "";

        // Format phone number if the country uses a trunk prefix and phone starts with "0"
        if (selectedCountry && countriesWithTrunkPrefix.includes(selectedCountry.code) && formattedPhone.startsWith("0")) {
            formattedPhone = formattedPhone.substring(1);
        }

        // Combine dial code with the formatted phone number
        const fullPhoneNumber = selectedCountry ? `${selectedCountry.dialCode} ${formattedPhone}` : formattedPhone;

        // Finalize values to be submitted
        const finalValues = {
            ...values,
            phone: fullPhoneNumber
        };

        // Prevent form submission if email status is not "success"
        if (emailStatus !== 'success') {
            return;
        }

        // Prepare DTO for registration
        const registerDTO = {
            fullname: finalValues.fullname,
            email: finalValues.email,
            phone: finalValues.phone,
            password: finalValues.password
        };

        // Call the register mutation
        register(registerDTO);
    };

    const [email, setEmail] = useState("");
    const [triggerCheckEmail, { isFetching }] = useLazyCheckEmailQuery();

    // Check if the email exists in the system
    const checkEmailExists = async () => {
        setEmailStatus("validating");
        setEmailHelp("Checking email availability...");

        try {
            const response = await triggerCheckEmail(email).unwrap();
            if (response.data === "true") {
                setEmailStatus("error");
                setEmailHelp("This email is already registered!");
            } else {
                setEmailStatus("success");
                setEmailHelp(null);
            }
        } catch (error) {
            setEmailStatus("error");
            setEmailHelp("Failed to validate email.");
        }
    };

    // Reset email status while typing
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailStatus(""); // Clear email status
        setEmailHelp(null);  // Clear email help text
    };

    // Validate email on blur
    const handleEmailBlur = async () => {
        if (!email) {
            setEmailStatus("error");
            setEmailHelp("Please input your email!");
            return;
        }
        if (email.length > 50) {
            setEmailStatus("error");
            setEmailHelp("Email cannot exceed 50 characters!");
            return;
        }

        // Check if the entered email matches a valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus("error");
            setEmailHelp("Please enter a valid email address!");
            return;
        }

        // Check email availability
        await checkEmailExists();
    };

    return (
        <>
            {contextHolder}
            {/* Registration Form */}
            <Form<FieldType>
                form={form}
                name='registerForm'
                className={'px-14'}
                layout="vertical"
                onFinish={onFinish}
                initialValues={formValues}
                onValuesChange={(_, allValues) => setFormValues(allValues)}
            >
                {/* Full Name */}
                <Form.Item
                    name="fullname"
                    label="Full Name"
                    rules={[
                        { required: true, message: 'Please input your full name!' },
                        { max: 255, message: 'Full name cannot exceed 255 characters!' }
                    ]}
                >
                    <Input placeholder="Enter your full name" />
                </Form.Item>
                {/* Email */}
                <Form.Item
                    name="email"
                    label="Email Address"
                    hasFeedback
                    validateTrigger="onFinish"
                    validateStatus={emailStatus}
                    help={emailHelp}
                    rules={[
                        { required: true, message: "Please input your email!" },
                        { type: "email", message: "Please enter a valid email address!" },
                        { max: 50, message: "Email cannot exceed 50 characters!" },
                    ]}
                >
                    <Input
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                    />
                </Form.Item>
                {/* Phone Number */}
                <Form.Item label="Phone Number">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        {/* Country Code Selector */}
                        <Select
                            loading={isLoadingCountry}
                            value={selectedCountry?.code || ''}
                            onChange={handleCountryChange}
                            dropdownStyle={{ width: 250 }}
                            style={{ width: 120, borderRight: "1px solid #ccc" }}
                            optionLabelProp="label2"
                            showSearch
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
                                                width={20} height={14}
                                                className="mr-2 intrinsic" preview={false}/>
                                             {country.code} {country.dialCode}
                                        </span>
                                    }
                                >
                                    <div className="flex items-center">
                                        <Image src={country.flag}
                                            alt={country.label}
                                            width={20} height={14}
                                            className="mr-2 intrinsic" />
                                        {country.dialCode} - {country.label}
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                        <Form.Item
                            name="phone"
                            rules={[{ required: true, message: 'Please input your phone number!' }]}
                            noStyle
                        >
                            {/* Phone Input */}
                            <Input
                                placeholder="Enter your phone number"
                                onChange={handlePhoneNumberChange}
                                style={{ flex: 1, border: "none", boxShadow: "none" }}
                            />
                        </Form.Item>
                    </div>
                </Form.Item>
            </Form>
        </>
    );
}