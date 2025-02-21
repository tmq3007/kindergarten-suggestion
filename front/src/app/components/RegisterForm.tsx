import React from 'react';
import {Button, Form, Input} from 'antd';
import Link from "next/link";

interface FieldType {
    fullname: string;
    email: string;
    phone?: string;
    password: string;
    confirm: string;
}

interface RegisterFormProps {
    onCancel: () => void; // Nhận function để đóng modal
}

export default function RegisterForm({onCancel}: RegisterFormProps) {
    const onFinish = (values: FieldType) => {
        console.log(values);
    };

    return (
        <Form<FieldType> className={'px-14'} name="register_form" layout="vertical" onFinish={onFinish}>
            <Form.Item
                name="fullname"
                label="Full Name"
                rules={[
                    {required: true, message: 'Please input your full name!'},
                    {max: 255, message: 'Full name cannot exceed 255 characters!'}
                ]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="email"
                label="Email Address"
                rules={[
                    {required: true, message: 'Please input your email!'},
                    {type: 'email', message: 'Please enter a valid email address!'},
                    {max: 50, message: 'Email cannot exceed 50 characters!'}
                ]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="phone"
                label="Mobile No."
                rules={[
                    {required: true, message: 'Please input your phone number!'},
                    {max: 20, message: 'Phone number cannot exceed 20 characters!'},
                    {pattern: /^[0-9]+$/, message: 'Phone number must be numeric!'}
                ]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="password"
                label="Password"
                rules={[
                    {required: true, message: 'Please input your password!'},
                    {min: 8, message: 'Password must be at least 8 characters!'},
                    {
                        pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must include uppercase, lowercase, and a number!'
                    }
                ]}
                hasFeedback
            >
                <Input.Password/>
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
                    ({getFieldValue}) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The new password that you entered do not match!'));
                        },
                    }),
                ]}
            >
                <Input.Password/>
            </Form.Item>

            <Form.Item className={'text-center'}>
                By signing up, you agree with our <Link href={''} className={'underline text-blue-500 hover:underline'}>Terms and Conditions.</Link>
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
