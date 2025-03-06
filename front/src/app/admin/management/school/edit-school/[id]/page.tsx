'use client'
import {useParams} from "next/navigation";
import {nunito} from "@/lib/fonts";
import {Badge, Form, Select} from "antd";
import {useGetSchoolQuery} from "@/redux/services/schoolApi";
import {useEffect} from "react";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import SchoolForm from "@/app/components/school/SchoolForm";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";

const {Option} = Select;

export default function EditSchool() {
    const params = useParams();
    const schoolId = params.id;
    const {data, isError, isLoading} = useGetSchoolQuery(Number(schoolId));
    const school = data?.data;
    const [form] = Form.useForm();
    console.log(data)
    useEffect(() => {
        if (school) {
            form.setFieldsValue({
                name: school.name || '',
                schoolType: school.schoolType || 'International school',
                province: school.province || '',
                district: school.district || '',
                ward: school.ward || '',
                street: school.street || '',
                email: school.email || '',
                phone: school.phone || '',
                receivingAge: school.receivingAge || '',
                educationMethod: school.educationMethod || '',
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                facilities: school.facilities || [],
                utilities: school.utilities || [],
                description: school.description || '',
            });
        }
    }, [school]);

    const theme = {
        paragraph: "text-base",
        text: "text-gray-900"
    };

    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
    };

    if (isLoading) {
        return (
            <SchoolFormSkeleton/>
        )
    }

    return (
        <>
            <MyBreadcrumb paths={
                [
                    {label: 'School Management'},
                    {label: 'Edit school'}
                ]
            }/>
            <div className={'flex items-center m-6'}>
                <span className={`${nunito.className} text-3xl font-bold mr-6`}>Edit school</span>
                <Badge className="h-1/2 bg-red-500 py-2 px-5 rounded-xl">Saved</Badge>
            </div>

            <SchoolForm form={form} hasSubmitButton={true}/>
        </>
    );
}