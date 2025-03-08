import React from 'react';
import {Checkbox, Form, Skeleton} from 'antd';
import {FACILITY_OPTIONS, UTILITY_OPTIONS} from '@/lib/constants';

const SchoolFormSkeleton: React.FC = () => {
    return (
        <>
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
                            <Form.Item
                                name="website"
                                label="School Website"
                            >
                                <Skeleton.Input active className={'!w-full'}/>
                            </Form.Item>
                        </div>
                        <div>
                            <Form.Item
                                name="facilities"
                                label="Facilities"
                            >
                                <Checkbox.Group
                                    options={FACILITY_OPTIONS}
                                    className="grid grid-cols-3 gap-2 custom-add-school-select"
                                />
                            </Form.Item>
                            <style>{`
                                    .custom-add-school-select .ant-checkbox-wrapper {
                                        display: flex;
                                        align-items: center;
                                    }
                        
                                    .custom-add-school-select .ant-checkbox-inner {
                                        width: 24px !important;
                                        height: 24px !important;
                                    }
                        
                                    .custom-add-school-select .ant-checkbox-input {
                                        transform: scale(2);
                                    }
                                `}</style>
                            <Form.Item
                                name="utilities"
                                label="Utilities"
                            >
                                <Checkbox.Group
                                    options={UTILITY_OPTIONS}
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