import {ForgotPasswordDTO, ForgotPasswordVO} from "@/redux/services/authApi";
import {ApiResponse, CustomFetchBaseQueryError} from "@/redux/services/config/baseQuery";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import React, {useEffect} from "react";
import {Button, Form, FormProps, Input, message, Space} from "antd";
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {lato, nunito} from "@/lib/fonts";


type FieldType = {
    email?: string;
};

type ForgotPasswordFormProp = {
    forgotPassword: (values: ForgotPasswordDTO) => any;
    data: ApiResponse<ForgotPasswordVO> | undefined
    isLoading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;
};

const ForgotPasswordForm: React.FC<ForgotPasswordFormProp> = ({forgotPassword, isLoading, data, error}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    const previous = useSelector((state: RootState) => state.auth.current_page);

    const handleCancel = () => {
        router.push(previous === 'admin' ? '/admin' : '/public');
    }

    useEffect(() => {

        if (data?.data) {
                messageApi.success("Please check your email").then(r => {
                    router.push(previous === 'admin' ? '/admin' : '/public');
                });
        }

        if (error && "data" in error) {
            const code = (error as CustomFetchBaseQueryError).data?.code;

            if (code == 1100) {
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
        const forgotPasswordDTO: ForgotPasswordDTO = {
            email: values.email || '',

        };
        forgotPassword(forgotPasswordDTO);
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            {contextHolder}
            <Form
                className={`${nunito.className} p-10 rounded-lg bg-white md:w-1/3 sm:w-full shadow-xl`}
                name="forgot-password-form"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >

                    <p className={`${lato.className} text-center text-4xl font-bold pb-6`}>Forgot Password</p>

                    <p className={'text-gray-400 text-center mx-20 mb-5'}>
                        Please enter your email address and we'll send you a link to reset your password
                    </p>


                <Form.Item<FieldType>
                    name="email"
                    className={'p-2'}
                    rules={[{required: true, message: 'Please input your email!'}]}
                    label={<span className={`${nunito.className}`}>Email address</span>}
                    labelCol={{span: 24}}
                    wrapperCol={{span: 24}}
                >
                    <Input/>
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
}

export default ForgotPasswordForm;
