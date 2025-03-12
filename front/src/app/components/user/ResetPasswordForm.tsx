'use client'

import {ResetPasswordDTO} from "@/redux/services/authApi";
import {ApiResponse, CustomFetchBaseQueryError} from "@/redux/services/config/baseQuery";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {Button, Form, FormProps, Input, message, Space} from "antd";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {lato, nunito} from "@/lib/fonts";


type FieldType = {
    password: string;
    confirm: string;
};

type ResetPasswordFormProp = {
    resetPassword: (values: ResetPasswordDTO) => any;
    data: ApiResponse<null> | undefined
    isLoading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProp> = ({resetPassword, isLoading, data, error}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    const previous = useSelector((state: RootState) => state.auth.current_page);

    const handleCancel = () => {
        router.push(previous === 'admin' ? '/admin' : '/public');
    }

    useEffect(() => {

        //Nếu reset password thành công thì thông báo thành công
        if (data?.code == 200) {
            messageApi.success("Password has been reset").then(() => {
                router.push(previous === 'admin' ? '/admin' : '/public');
            });
        }

        if (error && "data" in error) {
            const code = (error as CustomFetchBaseQueryError).data?.code;

            if (code == 1200) {
                messageApi.error("This link has been used!!").then(r => {
                    console.log(code)
                    router.push(previous === 'admin' ? '/admin' : '/public');
                });
            } else {
                messageApi.error("Something went wrong. Try again later!").then(r => {
                    console.log(code)
                });
            }

        }

    }, [data, error]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const resetPasswordDTO: ResetPasswordDTO = {
            password: values.password || '',
        };
        resetPassword(resetPasswordDTO);
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            {contextHolder}
            <Form
                className={`${nunito.className} p-10 rounded-lg bg-white md:w-1/3 sm:w-full shadow-xl`}
                name="reset-password-form"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >

                <p className={`${lato.className} text-center text-4xl font-bold pb-6`}>Reset Password</p>

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
                        {min: 7, message: 'Password must be at least 7 characters!'},
                        {
                            pattern: /^(?=.*[A-Za-z])(?=.*\d).{7,}$/,
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
                            className={'block w-80 md:w-36 mx-4 font-bold bg-white text-custom border border-custom hover:!border-custom-500 hover:!text-custom-500 transition'}
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>

                        <Button
                            className={'block w-80 md:w-36 mx-4 font-bold bg-custom hover:!bg-custom-700 text-white hover:!text-white border-none'}
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