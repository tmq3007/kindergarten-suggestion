'use client'

import {Indie_Flower, Nunito} from "next/font/google";
import {ForgotPasswordDTO, ResetPasswordDTO} from "@/redux/services/authApi";
import {ApiResponse, CustomFetchBaseQueryError} from "@/redux/services/config/baseQuery";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {Button, Form, FormProps, Input, message, Space} from "antd";
import {useRouter, useSearchParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";
import Link from "next/link";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";


type FieldType = {
    password: string;
    confirm: string;
};

const indie = Indie_Flower({
    subsets: ['latin'],
    weight: '400',
});

const nunito = Nunito({
    subsets: ['latin'],
});

type ResetPasswordFormProp = {
    resetpassword: (values: ResetPasswordDTO) => any;
    data: ApiResponse<null> | undefined
    isLoading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProp> = ({resetpassword, isLoading, data, error}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    const previous = useSelector((state: RootState) => state.auth.current_page);

    const handleCancel = () => {
        router.push(previous === 'admin' ? '/admin' : '/public');
    }

    useEffect(() => {

        //Nếu reset password thành công thì thông báo thành công
        if (data?.code === 200) {
            messageApi.success("Password has been reset").then(() => {
                router.push(previous === 'admin' ? '/admin' : '/public');
            });
        }

        if (error && "data" in error) {
            const code = (error as CustomFetchBaseQueryError).data?.code;

            if (code === 1001) {
                messageApi.error("Token is invalid!").then(r => {
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
        const resetpasswordDTO: ResetPasswordDTO = {
            password: values.password || '',
        };
        resetpassword(resetpasswordDTO);
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            {contextHolder}
            <Form
                className={`${nunito.className} p-10 rounded-lg bg-white md:w-1/3 sm:w-full shadow-xl`}
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >

                <p className={`${indie.className} text-center text-4xl font-bold pb-6`}>Reset Password</p>

                <p className={'text-gray-400 text-center mx-10 mb-5'}>
                    Please set your new password
                </p>



                <Form.Item<FieldType>
                    name="password"
                    label="Password"
                    labelCol={{span: 24}}
                    wrapperCol={{span: 24}}
                    rules={[
                        {required: true, message: 'Please input your password!'},
                        {min: 8, message: 'Password must be at least 8 characters!'},
                        {
                            pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: 'Password must include uppercase, lowercase, and a number!'
                        }
                    ]}
                    hasFeedback
                    extra="Use at least one uppercase, one lowercase, one number and five characters"
                >
                    <Input.Password/>


                </Form.Item>

                <Form.Item<FieldType>
                    name="confirm"
                    label="Confirm Password"
                    labelCol={{span: 24}}
                    wrapperCol={{span: 24}}
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

                <Form.Item label={null} wrapperCol={{span: 24}} className="text-center">
                    <Space className={'flex flex-col md:flex-row justify-center'}>

                        <Button
                            className={'block w-80 md:w-36 mx-4 font-bold bg-white text-cyan-500 border border-cyan-500 hover:bg-cyan-500 hover:text-white transition'}
                            type="primary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>

                        <Button
                            className={'block w-80 md:w-36 mx-4 font-bold bg-cyan-500 '}
                            type="primary"
                            htmlType="submit"
                            loading={isLoading} // Show loading when submitting
                        >
                            Submit
                        </Button>
                    </Space>

                </Form.Item>

            </Form>
        </>
    );

};

export default ResetPasswordForm;