'use client'
import React from 'react';
 import {
    Button,
    Cascader,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Mentions,
    Segmented,
    Select, Space,
    TreeSelect,
} from 'antd';
import { Breadcrumb } from 'antd';
import Link from "next/link";

const { RangePicker } = DatePicker;

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};

const App: React.FC = () => {
    const [form] = Form.useForm();
    return (
        <>
            <Breadcrumb
                items={[

                    {
                        title: <Link href="/management/user/create-user">User Management</Link>,
                    },

                    {
                        title: 'Add New User',
                    },
                ]}
            />
            <Form
                {...formItemLayout}
                labelCol={{ flex: '110px' }}
                labelAlign="left"
                labelWrap
                form={form}
                variant={'filled'}
                style={{ maxWidth: 600 }}
                initialValues={{ variant: 'filled' }}
                className={'w-full mx-auto mt-5 '}
            >

                <Form.Item label="User Name" name="username" rules={[{ required: true, message: 'Please input!' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Full Name" name="fullname" rules={[{ required: true, message: 'Please input!' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input!' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Phone No." name="phonenumber" rules={[{ required: true, message: 'Please input!' }]}>
                    <Input />
                </Form.Item>

                <Form.Item
                    label="DOB"
                    name="DOB"
                    rules={[{ required: true, message: 'Please input!' }]}
                >
                    <DatePicker />
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="Select"
                    rules={[{ required: true, message: 'Please input!' }]}
                >
                    <Select />
                </Form.Item>

                <Form.Item
                    label="Status"
                    name="Select"
                    rules={[{ required: true, message: 'Please input!' }]}
                >
                    <Select />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                    <Space>
                        <Button type="dashed" htmlType="button">
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Space>
                </Form.Item>

            </Form>
</>
    );
};

export default App;