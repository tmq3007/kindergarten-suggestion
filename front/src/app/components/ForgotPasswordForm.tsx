
import {Indie_Flower, Nunito} from "next/font/google";
import {ForgotPasswordDTO, ForgotPasswordVO} from "@/redux/services/authApi";
import {ApiResponse, CustomFetchBaseQueryError} from "@/redux/services/config/baseQuery";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import React, {useEffect} from "react";
import {Button, Form, FormProps, Input, message, Space} from "antd";
import {useRouter} from "next/navigation";
import Link from "next/link";


type FieldType = {
    email?: string;
};

const indie = Indie_Flower({
    subsets: ['latin'],
    weight: '400',
});

const nunito = Nunito({
    subsets: ['latin'],
});

type ForgotPasswordFormProp = {
    forgotpassword: (values: ForgotPasswordDTO) => any;
    data: ApiResponse<ForgotPasswordVO> | undefined
    isLoading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;
};

const ForgotPasswordForm: React.FC<ForgotPasswordFormProp> = ({forgotpassword, isLoading, data, error}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();


    useEffect(() => {

        if (data?.data) {
                messageApi.success("Please check your email").then(r => {
                    router.push("/admin")
                });
        }

        if (error && "data" in error) {
            const code = (error as CustomFetchBaseQueryError).data?.code;

            if (code === 1001) {
                messageApi.error("Email is not existed!").then(r => {
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
        const forgotpasswordDTO: ForgotPasswordDTO = {
            email: values.email || '',

        };
        forgotpassword(forgotpasswordDTO);
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

                    <p className={`${indie.className} text-center text-5xl font-bold pb-6`}>Forgot Password</p>

                    <p className={'text-gray-400 text-center text-xl mx-10 my-5'}>
                        Please enter your email address and we'll send you a link to reset your password
                    </p>



                <Form.Item<FieldType>
                    name="email"
                    className={'p-2'}
                    rules={[{required: true, message: 'Please input your email!'}]}
                    label={<span className={`${nunito.className} text-xl`}>Email address</span>}
                    labelCol={{span: 24}}
                    wrapperCol={{span: 24}}
                >
                    <Input className={'h-10'}/>
                </Form.Item>



                <Form.Item label={null} wrapperCol={{span: 24}} className="text-center">
                    <Space className={'flex flex-col md:flex-row items-center justify-center'}>
                        <Link href={"/admin"}>
                            <Button
                                className={'w-60 md:w-32 p-6 mx-4 font-bold bg-white text-cyan-500 border border-cyan-500 hover:bg-cyan-500 hover:text-white transition text-xl'}
                                type="primary"
                                loading={isLoading} // Show loading when submitting
                            >
                                Cancel
                            </Button>
                        </Link>

                        <Button
                            className={'w-60 md:w-32 p-6 mx-4 font-bold bg-cyan-500 text-xl'}
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
}

export default ForgotPasswordForm;
