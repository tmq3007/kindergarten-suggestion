'use client'
import {useParams} from "next/navigation";
import {nunito} from "@/lib/fonts";
import {Badge, Button, Checkbox, Col, Form, Input, InputNumber, Row, Select} from "antd";
import {FACILITIES, UTILITIES} from "@/lib/constants";
import MyEditor from "@/app/components/MyEditor";
import MyUpload from "@/app/components/MyUpload";
import {useGetSchoolQuery} from "@/redux/services/schoolApi";
import {useEffect} from "react";
import EditSchoolSkeleton from "@/app/components/EditSchoolSkeleton";

const {Option} = Select;

export default function EditSchool() {
    const params = useParams();
    const schoolId = params.id;
    const {data, isError, isLoading} = useGetSchoolQuery(Number(schoolId));
    const school = data?.data;
    const [form] = Form.useForm();
    useEffect(() => {
        if (school) {
            form.setFieldsValue({
                schoolName: school.name || '',
                schoolType: school.schoolType || 'International school',
                address: {
                    street: school.street || '',
                    ward: school.ward || '',
                    district: school.district || '',
                    province: school.province || '',
                },
                email: school.email || '',
                phoneNo: school.phone || '',
                childReceivingAge: school.receivingAge || 'lucy',
                educationMethod: school.educationMethod || 'Bi-lingual: VIE - ENG',
                feeRange: {
                    feeFrom: school.feeFrom || 0,
                    feeTo: school.feeTo || 0,
                },
                facilities: school.facilities || [],
                utilities: school.utilities || [],
                schoolIntroduction: school.description || '',
            });
        }
    }, [school, form]);
    console.log("school")
    console.log(data)
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

    if (isLoading) {
        return (
            <EditSchoolSkeleton/>
        )
    }

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
                    <Input/>
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
                        <Form.Item
                            name={['address', 'street']} // Truy cập trường con street
                            rules={[{required: true, message: 'Please input the street!'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            name={['address', 'ward']} // Truy cập trường con ward
                            rules={[{required: true, message: 'Please input the ward!'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            name={['address', 'district']} // Truy cập trường con district
                            rules={[{required: true, message: 'Please input the district!'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            name={['address', 'province']} // Truy cập trường con province
                            rules={[{required: true, message: 'Please input the province!'}]}
                        >
                            <Input/>
                        </Form.Item>
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
                    <Input/>
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
                    <Input/>
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
                                <InputNumber min={0} className={'w-[60%]'}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="feeTo" noStyle>
                                <span className={'font-bold mr-4'}>To</span>
                                <InputNumber min={0} className={'w-[60%]'}/>
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
                    <MyEditor description={form.getFieldValue('schoolIntroduction')}/>
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