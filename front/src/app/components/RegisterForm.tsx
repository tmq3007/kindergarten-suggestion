import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import Link from "next/link";
import { BASE_URL, baseQuery } from '@/redux/services/config/baseQuery';

interface FieldType {
    fullname: string;
    email: string;
    phone?: string;
    password: string;
    confirm: string;
    termAndCon: boolean;
}
interface RegisterFormProps {
    onCancel: () => void;
}

export default function RegisterForm({ onCancel }: RegisterFormProps) {
    const { data: countries, isLoading: isLoadingCountry, error } = useGetCountriesQuery();
    const [form] = Form.useForm();
    const router = useRouter();
    const [formValues, setFormValues] = useState<Partial<FieldType>>({ termAndCon: false });
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined);
    const [messageApi, contextHolder] = message.useMessage();
    const [register, { data: registerData, isLoading: isRegistering, error: registerError }] = useRegisterMutation();

    // Chon quoc gia mac dinh la VN
    useEffect(() => {
        if (countries && !selectedCountry) {
            const defaultCountry = countries.find((c) => c.code === "VN");
            setSelectedCountry(defaultCountry);
        }
    }, [countries])

    useEffect(() => {
        if (registerData?.code === 200) {
            messageApi.success("Register successfully! Redirecting to login page...");
            form.resetFields();
            setTimeout(() => {
                router.push('public/login');
            }, 2000);
        }
        if (registerError) {
            messageApi.error("Register failed!");
        }
    }, [registerData, registerError])

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

    // Xu ly submit form
    const onFinish = (values: FieldType) => {
        const countriesWithTrunkPrefix = ["VN", "GB", "IN", "JP", "ID", "DE", "IT", "AU", "ZA"];
        let formattedPhone = values.phone || "";


        // fomat lai so dien thoai
        if (selectedCountry && countriesWithTrunkPrefix.includes(selectedCountry.code) && formattedPhone.startsWith("0")) {
            formattedPhone = formattedPhone.substring(1);
        }

        const fullPhoneNumber = selectedCountry ? `${selectedCountry.dialCode} ${formattedPhone}` : formattedPhone;

        const finalValues = {
            ...values,
            phone: fullPhoneNumber
        };
        if(emailStatus !== 'success') {
            return;
        }
        const registerDTO = {
            fullname: finalValues.fullname,
            email: finalValues.email,
            phone: finalValues.phone,
            password: finalValues.password
        };

        register(registerDTO)

    };

    const [email, setEmail] = useState("");
    const [triggerCheckEmail, { isFetching }] = useLazyCheckEmailQuery();

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
    // Reset status when user starts typing
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailStatus(""); // Clear status when typing
        setEmailHelp(null);
    };

    // Validate on blur
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
        // Validate email format manually before calling API
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus("error");
            setEmailHelp("Please enter a valid email address!");
            return;
        }

        await checkEmailExists();
    };
    // // Kiem tra email da ton tai chua
    // const checkEmailExists = async (email: string) => {
    //     try {
    //         setEmailStatus('validating');
    //         setEmailHelp('Checking email availability...');

    //         const response = await fetch(BASE_URL + `/parent/check-email?email=${email}`);
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }

    //         const data = await response.json();
    //         if (data.data === "true") {
    //             setEmailStatus('error');
    //             setEmailHelp('This email is already registered!');
    //             return Promise.reject(new Error('This email is already registered!'));
    //         } else {
    //             setEmailStatus('success');
    //             setEmailHelp(null);
    //             return Promise.resolve();
    //         }
    //     } catch (error) {
    //         message.error('Error checking email. Please try again.');
    //         setEmailStatus('error');
    //         setEmailHelp('Failed to validate email.');
    //         return Promise.reject(new Error('Failed to validate email.'));
    //     }
    // };


    return (
        <>
            {contextHolder}
            <Form<FieldType>
                form={form}
                name='registerForm'
                className={'px-14'}
                layout="vertical"
                onFinish={onFinish}
                initialValues={formValues}
                onValuesChange={(_, allValues) => setFormValues(allValues)}
            >
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

                {/* <Form.Item
                    name="email"
                    label="Email Address"
                    validateTrigger="onBlur"
                    hasFeedback
                    validateStatus={emailStatus}
                    help={emailHelp}
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email address!' },
                        { max: 50, message: 'Email cannot exceed 50 characters!' },
                        ({ getFieldValue }) => ({
                            validator: async (_, value) => {
                                // nếu email trống thì thông báo lỗi
                                if (!value) {
                                    setEmailStatus('error');
                                    setEmailHelp('Please input your email!');
                                    return Promise.reject(new Error('Please input your email!'));
                                }

                                // Kiểm tra email có đúng định dạng không
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(value)) {
                                    setEmailStatus('error');
                                    setEmailHelp('Please enter a valid email address!');
                                    return Promise.reject(new Error('Please enter a valid email address!'));
                                }
                                return checkEmailExists(value);
                            },
                        }),
                    ]}
                >
                    <Input placeholder="Enter your email" />
                </Form.Item> */}
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
                <Form.Item label="Phone Number" >
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
                                                className="mr-2 intrinsic" />
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
                            {/* Phone Number Input */}
                            <Input
                                placeholder="Enter your phone number"
                                onChange={handlePhoneNumberChange}
                                style={{ flex: 1, border: "none", boxShadow: "none" }}
                            />
                        </Form.Item>
                    </div>
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: 'Please input your password!' },
                        { min: 7, message: 'Password must be at least 7 characters!' },
                        {
                            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{7,}$/,
                            message: 'Password must contain at least one letter, and one number!'
                        }
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder='Enter password' />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    label="Confirm Password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The new password that you entered do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder='Enter confirm password' />
                </Form.Item>

                <Form.Item
                    name="termAndCon"
                    valuePropName="checked"
                    className='justify-center flex'
                    rules={[{
                        validator: (_, value) =>
                            value ? Promise.resolve() : Promise.reject(new Error('Please agree to our terms and conditions!'))
                    }]}
                    shouldUpdate
                >
                    <Checkbox>
                        I agree to the <Link className="text-blue-500" href=""> Terms and Conditions</Link>
                    </Checkbox>
                </Form.Item>

                <div className={'flex justify-between'}>
                    <Button onClick={onCancel} className={'w-2/5 border-blue-400'} type="default">
                        Cancel
                    </Button>
                    <Button className={'w-2/5'} type="primary" htmlType="submit" loading={isRegistering}>
                        Sign Up
                    </Button>
                </div>
            </Form >
        </>
    );
}
