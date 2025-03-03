'use client'
import {nunito} from "@/lib/fonts";
import {FACILITIES, UTILITIES} from "@/lib/constants";
import MyUpload from "@/app/components/MyUpload";
import {Badge, Button, Checkbox, Col, Form, Row, Select, Skeleton} from "antd";

const {Option} = Select;

export default function EditSchoolSkeleton() {
    return (
        <>
            <nav className="text-sm mb-6 ">
                <span className="text-blue-600 hover:text-blue-600 cursor-pointer">School Management</span> {" > "}
                <span className="text-blue-600 hover:text-blue-600 cursor-pointer">Edit school</span>
            </nav>
            <div className={'flex items-center m-6'}>
                <span className={`${nunito.className} text-3xl font-bold mr-6`}>Edit school</span>
                <Badge className="h-1/2 bg-red-500 py-2 px-5 rounded-xl">Saved</Badge>
            </div>

            <Form
                name="edit-school-form"
                layout="horizontal"
                labelAlign={'left'}
                requiredMark={false}
                className={'w-full lg:w-[50%] m-auto'}
            >
                <Form.Item
                    name="schoolName"
                    label="School Name"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="schoolType"
                    label="School Type"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Address"
                    labelCol={{
                        span: 24,
                        lg: { span: 6 },
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: { span: 18 },
                    }}
                >
                    <div className={'flex flex-col gap-2'}>
                        <Form.Item
                            name={['address', 'street']} // Truy cập trường con street
                            rules={[{ required: true, message: 'Please input the street!' }]}
                        >
                            <Skeleton.Input active={true} className={'!w-full'}/>
                        </Form.Item>
                        <Form.Item
                            name={['address', 'ward']} // Truy cập trường con ward
                            rules={[{ required: true, message: 'Please input the ward!' }]}
                        >
                            <Skeleton.Input active={true} className={'!w-full'}/>
                        </Form.Item>
                        <Form.Item
                            name={['address', 'district']} // Truy cập trường con district
                            rules={[{ required: true, message: 'Please input the district!' }]}
                        >
                            <Skeleton.Input active={true} className={'!w-full'}/>
                        </Form.Item>
                        <Form.Item
                            name={['address', 'province']} // Truy cập trường con province
                            rules={[{ required: true, message: 'Please input the province!' }]}
                        >
                            <Skeleton.Input active={true} className={'!w-full'}/>
                        </Form.Item>
                    </div>
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="phoneNo"
                    label="Phone No."
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="childReceivingAge"
                    label="Child-receiving Age"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="educationMethod"
                    label="Education Method"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full'}/>
                </Form.Item>

                <Form.Item
                    name="feeRange"
                    label="Fee/month (VND)"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Row gutter={18}>
                        <Col span={12}>
                            <Form.Item name="feeFrom" noStyle>
                                <span className={'font-bold mr-4'}>From</span>
                                <Skeleton.Input active={true} className={'w-[80%]'}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="feeTo" noStyle>
                                <span className={'font-bold mr-4'}>To</span>
                                <Skeleton.Input active={true} className={'w-[80%]'}/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>

                <Form.Item
                    name="facilities"
                    label="Facilities"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <div className={'flex'}>
                        <div className={'flex flex-col gap-4 w-1/3'}>
                            <Checkbox>
                                {FACILITIES.OUTDOOR_PLAYGROUND.name}
                            </Checkbox>
                            <Checkbox>
                                {FACILITIES.CAFETERIA.name}
                            </Checkbox>
                            <Checkbox>
                                {FACILITIES.LIBRARY.name}
                            </Checkbox>
                            <Checkbox>
                                {FACILITIES.PE_ROOM.name}
                            </Checkbox>
                        </div>
                        <div className={'flex flex-col gap-4 w-1/3'}>
                            <Checkbox>
                                {FACILITIES.ART_ROOM.name}
                            </Checkbox>
                            <Checkbox>
                                {FACILITIES.SWIMMING_POOL.name}
                            </Checkbox>
                            <Checkbox>
                                {FACILITIES.MONTESSORI_ROOM.name}
                            </Checkbox>
                            <Checkbox>
                                {FACILITIES.STEM_ROOM.name}
                            </Checkbox>
                        </div>
                        <div className={'flex flex-col gap-4 w-1/3'}>
                            <Checkbox>
                                {FACILITIES.MUSICAL_ROOM.name}
                            </Checkbox>
                            <Checkbox>
                                {FACILITIES.CAMERA.name}
                            </Checkbox>
                        </div>
                    </div>
                </Form.Item>

                <Form.Item
                    name="utilities"
                    label="Utilities"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <div className={'flex'}>
                        <div className={'flex flex-col gap-4 w-1/3'}>
                            <Checkbox>
                                {UTILITIES.SCHOOL_BUS.name}
                            </Checkbox>
                            <Checkbox>
                                {UTILITIES.BREAKFAST.name}
                            </Checkbox>
                            <Checkbox>
                                {UTILITIES.AFTER_SCHOOL_CARE.name}
                            </Checkbox>
                            <Checkbox>
                                {UTILITIES.SATURDAY_CLASS.name}
                            </Checkbox>
                        </div>
                        <div className={'flex flex-col gap-4 w-1/3'}>
                            <Checkbox>
                                {UTILITIES.HEALTH_CHECK.name}
                            </Checkbox>
                            <Checkbox>
                                {UTILITIES.PICNIC_ACTIVITIES.name}
                            </Checkbox>
                            <Checkbox>
                                {UTILITIES.E_CONTACT_BOOK.name}
                            </Checkbox>
                        </div>
                    </div>
                </Form.Item>

                <Form.Item
                    name="schoolIntroduction"
                    label="School Introduction"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full !h-[200px]'}/>
                </Form.Item>

                <Form.Item
                    name="schoolImage"
                    label="School Image"
                    labelCol={{
                        span: 24,
                        lg: {span: 6},
                        className: 'font-bold'
                    }}
                    wrapperCol={{
                        span: 24,
                        lg: {span: 18},
                    }}
                >
                    <Skeleton.Input active={true} className={'!w-full !h-[100px]'}/>
                </Form.Item>

                <div className={'flex justify-end gap-3.5'}>
                    <Button type="default" className={'w-[20%] md:w-[10%]'}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" className={'w-[20%] md:w-[10%]'}>
                        Submit
                    </Button>
                </div>
            </Form>
        </>
    );
}