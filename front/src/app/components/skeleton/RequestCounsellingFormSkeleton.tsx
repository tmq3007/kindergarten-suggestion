import React from "react";
import {Button, Form, Skeleton} from "antd";
import MyEditor from "@/app/components/common/MyEditor";


const RequestCounsellingFormSkeleton: React.FC = () => {
    return (
        <>
        <div className="w-1/2 mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form
                size="middle"
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
                    <Skeleton.Input active className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                >
                    <Skeleton.Input active className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Phone No."
                >
                    <Skeleton.Input active className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Address"
                >
                    <Skeleton.Input active className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="requested_school"
                    label="Requested school"
                >
                    <Skeleton.Input active className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="inquiries"
                    label="Inquiries"
                >
                    <Skeleton.Input active className={'!w-full !h-[200px]'}/>
                </Form.Item>

            </Form>
        </div>

    <div className="w-1/2 mx-auto p-6 bg-white rounded-lg shadow-md mt-5">
        <Form
            size="middle"
            labelCol={{ span: 6, className: 'font-bold' }}
            labelAlign="left"
            labelWrap
            layout="horizontal"
            className="space-y-6 h-auto"
        >
            <Form.Item
                name="inquiries"
                label="Responses"
            >
                <Skeleton.Input active className={'!w-full !h-[200px]'}/>
            </Form.Item>
        </Form>
    </div>
    </>
    );
}

export default RequestCounsellingFormSkeleton;