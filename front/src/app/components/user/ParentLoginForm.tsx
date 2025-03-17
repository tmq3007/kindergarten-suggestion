import React from 'react';
import {Button, Divider, Form, FormProps, Input, message} from 'antd';
import Link from "next/link";
import {LoginDTO, useLoginByParentMutation} from "@/redux/services/authApi";
import useAuthRedirect from "@/lib/hook/useAuthRedirect";
import {useDispatch} from "react-redux";
import {setPreviousPage} from "@/redux/features/authSlice";

interface FieldType {
    email: string;
    password: string;
}

interface RegisterFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export default function ParentLoginForm({onCancel, onSuccess}: RegisterFormProps) {
    const [login, {data, isLoading, error}] = useLoginByParentMutation();
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();

    const handleForgotPassword = () => {
        // Identify the current page using the pathname
        const currentPath = window.location.pathname.includes('/admin') ? 'admin' : 'public';
        dispatch(setPreviousPage(currentPath)); // Save before state
    };

    useAuthRedirect(data, error, messageApi, '/public', true, onSuccess);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const loginDTO: LoginDTO = {
            email: values.email || '',
            password: values.password || '',
        };
        login(loginDTO);
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        messageApi.error('Something went wrong. Try again later!').then(r => console.log(r));
    };


    return (
        <>
            {contextHolder}
            <Form<FieldType> className={'px-14 py-4'} name="register_form" layout="vertical" onFinish={onFinish}
                             initialValues={{remember: true}}>
                <Form.Item
                    name="email"
                    label="Email Address"
                    hasFeedback
                    rules={[
                        {required: true, message: 'Please input your email!'},
                        {type: 'email', message: 'Please enter a valid email address!'},
                        {max: 50, message: 'Email cannot exceed 50 characters!'},
                    ]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
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
                    <Input.Password/>
                </Form.Item>
                <Link href={'/forgot-password'}
                      className={'block text-right text-blue-500 underline hover:underline mb-6'}
                      onClick={handleForgotPassword}>Forgot password?</Link>
                <Button className={'w-full border-blue-400'} type="primary" htmlType={"submit"} loading={isLoading}>
                    Login now
                </Button>
                <Divider className={'!text-gray-300'}>OR</Divider>
                <Button className={'w-full border-blue-400'} type="default" onClick={onCancel}>
                    Signup now
                </Button>
            </Form>
        </>
    );
}
