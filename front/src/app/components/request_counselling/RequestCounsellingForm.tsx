'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const { Option } = Select;
const { TextArea } = Input;

interface RequestCounsellingFieldType {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    requested_school: string;
    inquiries: string;
    response: string;
}


interface RequestCounsellingFormFields {
    isReadOnly?: boolean;
    form?: any;
    formLoaded?: boolean;
}

const RequestCounsellingForm: React.FC<RequestCounsellingFormFields> = ({
                                                                            isReadOnly,
                                                                            form: externalForm,
                                                                            formLoaded = false,
                                                                        }) => {
    const [form] = Form.useForm(externalForm);

    return (
        <div className="w-1/2 mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form<RequestCounsellingFormFields>
                size="middle"
                form={form}
                labelCol={{ span: 6, className: 'font-bold' }}
                labelAlign="left"
                labelWrap
                layout="horizontal"
                className="space-y-6 h-auto"
            >


                <Form.Item
                    name="full_name"
                    label="Full Name"
                >
                    <Input placeholder="Enter your name..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                >
                    <Input placeholder="Enter your email..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Phone No."
                >
                    <Input placeholder="Enter your phone number..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Address"
                >
                    <Input placeholder="Enter your address..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="requested_school"
                    label="Requested school"
                    rules={[{ required: true, message: 'Please select a school' }]}
                >
                    <Input placeholder="Enter your phone number..." readOnly={isReadOnly} />
                </Form.Item>

                <Form.Item
                    name="inquiries"
                    label="Inquiries"
                    rules={[{ required: true, message: 'Please enter your inquiry' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter your inquiry..."
                        readOnly={isReadOnly}
                    />
                </Form.Item>

            </Form>
        </div>
    );
};

export default RequestCounsellingForm;