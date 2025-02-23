import React, {useEffect} from 'react';
import {FormProps, message} from 'antd';
import {Button, Form, Input} from 'antd';
import {Indie_Flower, Nunito} from "next/font/google";
import Link from "next/link";
import {LoginDTO, LoginVO} from "@/redux/services/types";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {ApiResponse, CustomFetchBaseQueryError} from "@/redux/services/config/baseQuery";
import {useRouter} from "next/navigation";

type FieldType = {
    username: string;
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


const LoginForm: React.FC<LoginFormProps> = ({login, isLoading, data, error}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    useEffect(() => {
        if (data?.data) {
            // Gửi dữ liệu đăng nhập thành công đến /api/auth
            fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data.data),
            })
                .then(() => router.push('/admin/management'))
                .catch(error => {
                    messageApi.error("Authentication failed.").then(r => {
                        console.log(error)
                    });
                });
        }

        if (error && "data" in error) {
            const code = (error as CustomFetchBaseQueryError).data?.code;

            if (code === 1000) {
                messageApi.error("Username or password is wrong.").then(r => {
                    console.log(code)
                });
            } else {
                messageApi.error("Something went wrong. Try again later!").then(r => {
                    console.log(code)
                });
            }

        }

    }, [data, error]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const loginDTO: LoginDTO = {
            username: values.username || '',
            password: values.password || '',
        };
        login(loginDTO);
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
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
                    name="username"
                    rules={[{required: true, message: 'Please input your username!'}]}
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

export default LoginForm;
