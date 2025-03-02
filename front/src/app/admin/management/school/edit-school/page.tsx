'use client'
import {useSearchParams} from "next/navigation";
import {nunito} from "@/lib/fonts";
import {Badge, Button, Checkbox, Col, Form, Input, InputNumber, Row, Select} from "antd";
import {FACILITIES, UTILITIES} from "@/lib/constants";
import MyEditor from "@/app/components/MyEditor";
import MyUpload from "@/app/components/MyUpload";

const {Option} = Select;

export default function EditSchool() {
    const searchParams = useSearchParams();
    const schoolId = searchParams.get('schoolId');
    const [form] = Form.useForm();

    const theme = {
        paragraph: "text-base",
        text: "text-gray-900"
    };
    const receivingAgeOptions = [
        {value: 'jack', label: 'Jack'},
        {value: 'lucy', label: 'Lucy'},
        {value: 'Yiminghe', label: 'yiminghe'},
    ];

    const educationMethodOptions = [
        {value: 'International school', label: 'International school'},
        {value: 'Monolingual', label: 'Monolingual'}
    ]

    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
    };

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
                form={form}
                name="school_form"
                onFinish={onFinish}
                layout="horizontal"
                initialValues={{
                    schoolType: 'International school',
                    educationMethod: 'Bi-lingual: VIE - ENG',
                    childReceivingAge: 'lucy',
                }}
                labelAlign={'left'}
                requiredMark={false}
                className={'w-full lg:w-[50%] m-auto'}
            >
                <Form.Item
                    name="schoolName"
                    label="School Name"
                    rules={[{required: true, message: 'Please input the school name!'}]}
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
                    <Input placeholder="Luong The Vinh Kinder Garten"/>
                </Form.Item>

                <Form.Item
                    name="schoolType"
                    label="School Type"
                    rules={[{required: true, message: 'Please select the school type!'}]}
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
                    <Select>
                        <Option value="International school">International school</Option>
                        <Option value="Local school">Local school</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Address"
                    rules={[{required: true, message: 'Please input the address!'}]}
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
                    <div className={'flex flex-col gap-2'}>
                        <Input placeholder="No.10 Luong The Vinh St., Thanh Xuan, Ha Dong, Ha Noi"/>
                        <Input placeholder="No.10 Luong The Vinh St., Thanh Xuan, Ha Dong, Ha Noi"/>
                        <Input placeholder="No.10 Luong The Vinh St., Thanh Xuan, Ha Dong, Ha Noi"/>
                        <Input placeholder="No.10 Luong The Vinh St., Thanh Xuan, Ha Dong, Ha Noi"/>
                    </div>
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{required: true, message: 'Please input the email!'}]}
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
                    <Input placeholder="luongthevinh@gmail.com"/>
                </Form.Item>

                <Form.Item
                    name="phoneNo"
                    label="Phone No."
                    rules={[{required: true, message: 'Please input the phone number!'}]}
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
                    <Input placeholder="0123656769"/>
                </Form.Item>

                <Form.Item
                    name="childReceivingAge"
                    label="Child-receiving Age"
                    rules={[{required: true, message: 'Please input the age range!'}]}
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
                    <Select>
                        {receivingAgeOptions.map(option => (
                            <Option key={option.value} value={option.value}>{option.label}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="educationMethod"
                    label="Education Method"
                    rules={[{required: true, message: 'Please select the education method!'}]}
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
                    <Select>
                        {educationMethodOptions.map(option => (
                            <Option key={option.value} value={option.value}>{option.label}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="feeRange"
                    label="Fee/month (VND)"
                    rules={[{required: true, message: 'Please input the fee range!'}]}
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
                                <InputNumber min={0} className={'w-[80%]'}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="feeTo" noStyle>
                                <span className={'font-bold mr-4'}>To</span>
                                <InputNumber min={0} className={'w-[80%]'}/>
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
                    <MyEditor/>
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
                    <MyUpload/>
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