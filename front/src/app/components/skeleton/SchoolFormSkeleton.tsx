import React from 'react';
import {Badge, Button, Checkbox, Form, Skeleton} from 'antd';
import {FACILITIES_OPTIONS, UTILITIES_OPTIONS} from '@/lib/constants';
import {nunito} from "@/lib/fonts";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";

const SchoolFormSkeleton: React.FC = () => {
    return (
        <>
            <MyBreadcrumb paths={
                [
                    {label: 'School Management'},
                    {label: 'Edit school'}
                ]
            }/>
            <div className="flex items-center m-6">
                <span className={`${nunito.className} text-3xl font-bold mr-6`}>Edit school</span>
                <Badge className="h-1/2 bg-red-500 py-2 px-5 rounded-xl">Saved</Badge>
            </div>
            <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
                <Form
                    labelCol={{span: 6, className: 'font-bold'}}
                    labelAlign='left'
                    labelWrap
                    layout="horizontal"
                    className="space-y-6 h-auto"
                >
                    <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
                        <div>
                            <Form.Item
                                name="name"
                                label="School Name"
                                rules={[{required: true}]}>
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>

                            <Form.Item
                                name="schoolType"
                                label="School Type"
                                rules={[{required: true}]}
                            >
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>

                            <Form.Item label="Address" className='space-y-4' required>
                                <Form.Item
                                    name="province"
                                    className="mb-5"
                                    rules={[{required: true}]}
                                >
                                    <Skeleton.Input active className={'!w-full'}/>
                                </Form.Item>
                                <Form.Item
                                    name="district"
                                    className="mb-5"
                                    rules={[{required: true}]}
                                >
                                    <Skeleton.Input active className={'!w-full'}/>
                                </Form.Item>
                                <Form.Item
                                    name="ward"
                                    className="mb-5"
                                    rules={[{required: true}]}
                                >
                                    <Skeleton.Input active className={'!w-full'}/>
                                </Form.Item>
                                <Form.Item name="street" className='mb-4'>
                                    <Skeleton.Input active className={'!w-full'}/>
                                </Form.Item>
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email Address"
                                rules={[{required: true}]}
                            >
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Phone Number"
                                rules={[{required: true}]}
                            >
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>

                            <Form.Item
                                name="receivingAge"
                                label="Child receiving age"
                                rules={[{required: true}]}
                            >
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>

                            <Form.Item
                                name="educationMethod"
                                label="Education method"
                                rules={[{required: true}]}
                            >
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>

                            <Form.Item label="Fee/Month (VND)" required>
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item
                                        name="feeFrom"
                                        label="From"
                                        rules={[{required: true}]}
                                    >
                                        <Skeleton.Input active className={'!w-full'}/>
                                    </Form.Item>
                                    <Form.Item
                                        name="feeTo"
                                        label="To"
                                        rules={[{required: true}]}
                                    >
                                        <Skeleton.Input active className={'!w-full'}/>
                                    </Form.Item>
                                </div>
                            </Form.Item>
                        </div>
                        <div>
                            <Form.Item
                                name="website"
                                label="School Website"
                            >
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>

                            <Form.Item
                                name="facilities"
                                label="Facilities"
                            >
                                <Checkbox.Group
                                    options={FACILITIES_OPTIONS}
                                    className="grid grid-cols-3 gap-2 custom-add-school-select"
                                />
                            </Form.Item>

                            <Form.Item
                                name="utilities"
                                label="Utilities"
                            >
                                <Checkbox.Group
                                    options={UTILITIES_OPTIONS}
                                    className="grid grid-cols-3 gap-2 custom-add-school-select"
                                />
                            </Form.Item>
                            <style>{`
                                .custom-add-school-select .ant-checkbox-inner {
                                    width: 24px !important;
                                    height: 24px !important;
                                }
                                .custom-add-school-select .ant-checkbox-input {
                                    transform: scale(2);
                                }
                            `}</style>
                            <Form.Item
                                name="description"
                                label="School introduction"
                            >
                                <Skeleton.Input active className={'!w-full !h-[200px]'}/>
                            </Form.Item>

                            <Form.Item
                                label="School image"
                            >
                                <Form.Item name="image" valuePropName="fileList" noStyle>
                                    <Skeleton.Input active={true} className={'!w-full !h-[100px]'}/>
                                </Form.Item>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </div>
        </>
    );
};

export default SchoolFormSkeleton;