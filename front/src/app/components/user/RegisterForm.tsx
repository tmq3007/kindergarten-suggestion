import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import {useLazyCheckEmailQuery, useRegisterMutation} from '@/redux/services/registerApi';
import Link from 'next/link';
import PhoneInput from '../common/PhoneInput';
import EmailInput from '../common/EmailInput';
import {useLazyCheckPhoneQuery} from "@/redux/services/userApi";

interface FieldType {
    fullname: string;
    email: string;
    phone?: string;
    password: string;
    confirm: string;
    termAndCon: boolean;
}
interface RegisterFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function RegisterForm({ onSuccess, onCancel }: RegisterFormProps) {
    const [form] = Form.useForm();
    const emailInputRef = useRef<any>(null);
    const phoneInputRef = useRef<any>(null);

    const [formValues, setFormValues] = useState<Partial<FieldType>>({ termAndCon: false })
    const [messageApi, contextHolder] = message.useMessage();
    const [register, { data: registerData, isLoading: isRegistering, error: registerError }] = useRegisterMutation();
    const [triggerCheckEmail] = useLazyCheckEmailQuery();
    const [triggerCheckPhone] = useLazyCheckPhoneQuery();

    useEffect(() => {
        // Handle successful registration
        if (registerData?.code === 201) {
            messageApi.success("Register successfully! Redirecting to login page...");
            setFormValues({});
            setTimeout(() => {
                onSuccess();
            }, 2500);
        }
        // Handle registration error
        if (registerError) {
            messageApi.error("Register failed!");
        }
    }, [registerData, registerError])

    // Handle form submission
    const onFinish = async (values: FieldType) => {

        const isEmailValid = await emailInputRef.current?.validateEmail();
        const isPhoneValid = await phoneInputRef.current?.validatePhone();
        if (!isEmailValid || !isPhoneValid) {
            return;
        }

        const fullPhoneNumber = phoneInputRef.current?.getFormattedPhoneNumber() || values.phone;

        // Finalize values to be submitted
        const finalValues = {
            ...values,
            phone: fullPhoneNumber
        };


        // Prepare DTO for registration
        const registerDTO = {
            fullname: finalValues.fullname,
            email: finalValues.email,
            phone: finalValues.phone,
            password: finalValues.password
        };

        // Call the register mutation
        register(registerDTO);
    };

    return (
        <>
            {contextHolder}
            {/* Registration Form */}
            <Form<FieldType>
                form={form}
                name='registerForm'
                className={'px-14'}
                layout="vertical"
                onFinish={onFinish}
                initialValues={formValues}
                onValuesChange={(_, allValues) => setFormValues(allValues)}
            >
                {/* Full Name */}
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
                {/* Email */}
                <EmailInput
                    form={form}
                    ref={emailInputRef}
                    triggerCheckEmail={triggerCheckEmail}
                />
                {/* Phone Number */}
                <PhoneInput
                    triggerCheckPhone={triggerCheckPhone}
                    form={form}
                    ref={phoneInputRef}
                    onPhoneChange={(phone) => form.setFieldsValue({ phone })}
                />
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: 'Please input your password!' },
                        { min: 7, message: 'Password must be at least 7 characters!' },
                        {
                            pattern: /^(?=.*[A-Za-z])(?=.*\d).{7,}$/,
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