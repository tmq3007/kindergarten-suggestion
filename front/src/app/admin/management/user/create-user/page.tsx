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
    TreeSelect, Typography,
} from 'antd';
import { Breadcrumb } from 'antd';
import Link from "next/link";
import dayjs from "dayjs";
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

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

const CreateUser: React.FC = () => {
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
            <Title level={3} className="my-2 ml-16">Add New User</Title>
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

                <Form.Item label="User Name"  name="username"  >
                    <Input placeholder="System Auto Generate" disabled />
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
                    <DatePicker disabledDate={(current) => current && current > dayjs().endOf('day')} />
                </Form.Item>


                <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: 'Please select a role!' }]}
                >
                    <Select placeholder="Select a role">
                        <Option value="admin">Admin</Option>
                        <Option value="school_owner">School Owner</Option>
                        <Option value="parent">Parent</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    initialValue={'1'}
                    label="Status"
                    name="Select"
                    rules={[{ required: true, message: 'Please choose status!' }]}
                >
                    <Select   placeholder="Select status">
                        <Option value="1">Active</Option>
                        <Option value="0">Inactive</Option>

                    </Select>
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

export default CreateUser;