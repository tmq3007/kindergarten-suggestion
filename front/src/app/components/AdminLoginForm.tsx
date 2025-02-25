import React from 'react';
import {Button, Form, FormProps, Input, message} from 'antd';
import {Indie_Flower, Nunito} from "next/font/google";
import Link from "next/link";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {ApiResponse} from "@/redux/services/config/baseQuery";
import {LoginDTO, LoginVO} from "@/redux/services/authApi";
import useAuthRedirect from "@/lib/useAuthRedirect";
import { motion } from 'framer-motion';

type FieldType = {
    email: string;
    password: string;
};

const indie = Indie_Flower({
    subsets: ['latin'],
    weight: '400',
});

const nunito = Nunito({
    subsets: ['latin'],
});

type LoginFormProps = {
    login: (values: LoginDTO) => any;
    data: ApiResponse<LoginVO> | undefined;
    isLoading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;
};

const AdminLoginForm: React.FC<LoginFormProps> = ({login, isLoading, data, error}) => {
    const [messageApi, contextHolder] = message.useMessage();

    useAuthRedirect(data, error, messageApi, '/admin/management', false);

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
            <Form
                className={`${nunito.className} p-10 rounded-lg bg-white md:w-1/3 sm:w-full shadow-xl`}
                name="login_form"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <p className={`${indie.className} text-center text-4xl font-bold pb-6`}>Login into your account</p>
                <Form.Item<FieldType>
                    name="email"
                    rules={[{required: true, message: 'Please input your email!'}]}
                    label={<span className={`${nunito.className}`}>Email address</span>}
                    labelCol={{span: 24}}
                    wrapperCol={{span: 24}}
                >
                    <Input/>
                </Form.Item>

                <Form.Item<FieldType>
                    name="password"
                    rules={[{required: true, message: 'Please input your password!'}]}
                    label={<span className={`${nunito.className}`}>Password</span>}
                    labelCol={{span: 24}}
                    wrapperCol={{span: 24}}
                >
                    <Input.Password/>
                </Form.Item>

                <div className={"text-right underline text-blue-500 pb-5"}>
                    <Link href={"/forgot-password"}>Forgot passwords</Link>
                </div>

                <Form.Item label={null} wrapperCol={{span: 24}} className="text-center">
                    <Button
                        className={"w-1/3 font-bold bg-cyan-500"}
                        type="primary"
                        htmlType="submit"
                        loading={isLoading} // Show loading when submitting
                    >
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}

export default AdminLoginForm;
