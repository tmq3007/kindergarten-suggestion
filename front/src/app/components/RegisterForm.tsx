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

    const [form] = Form.useForm();
    const [formValues, setFormValues] = useState<Partial<FieldType>>({ termAndCon: false });
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);

    const onFinish = (values: FieldType) => {
        console.log(values);
    };
    // Function to check if email exists in the backend
    const checkEmailExists = async (email: string) => {
        try {
            setEmailStatus('validating'); // Show validation in progress
            setEmailHelp('Checking email availability...');

            const response = await fetch(BASE_URL + `/user/check-email?email=${email}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data === "true") {
                setEmailStatus('error');
                setEmailHelp('This email is already registered!');
                return Promise.reject(new Error('This email is already registered!'));
            } else {
                setEmailStatus('success');
                setEmailHelp(null);
                return Promise.resolve();
            }
        } catch (error) {
            message.error('Error checking email. Please try again.');
            setEmailStatus('error');
            setEmailHelp('Failed to validate email.');
            return Promise.reject(new Error('Failed to validate email.'));
        }
    };


    return (
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
                <Input />
            </Form.Item>

            <Form.Item
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
                <Input />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Mobile No."
                rules={[
                    { required: true, message: 'Please input your phone number!' },
                    { max: 20, message: 'Phone number cannot exceed 20 characters!' },
                    { pattern: /^[0-9]$/, message: 'Phone number must be numeric!' }
                ]}
            >
                <Input />
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
                <Input.Password />
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
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="termAndCon"
                valuePropName="checked" // ✅ Important to bind the checkbox correctly
                rules={[
                    {
                        validator: (_, value) =>
                            value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms and conditions!'))
                    }
                    
                ]}
                shouldUpdate
            >
                <Checkbox>
                    By signing up, you agree with our{' '}
                    <Link href={''} className="underline text-blue-500 hover:underline">
                        Terms and Conditions.
                    </Link>
                </Checkbox>
            </Form.Item>

            <div className={'flex justify-between'}>
                <Button onClick={onCancel} className={'w-2/5 border-blue-400'} type="default">
                    Cancel
                </Button>
                <Button className={'w-2/5'} type="primary" htmlType="submit">
                    Sign Up
                </Button>
            </div>
        </Form>
    );
}
