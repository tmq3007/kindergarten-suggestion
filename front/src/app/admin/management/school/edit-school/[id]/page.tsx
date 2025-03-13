'use client';
import {useParams} from "next/navigation";
import {nunito} from "@/lib/fonts";
import {Badge, Form} from "antd";
import {useGetSchoolQuery} from "@/redux/services/schoolApi";
import React, {useEffect} from "react";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import SchoolForm from "@/app/components/school/SchoolForm";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import {SCHOOL_STATUS_OPTIONS} from "@/lib/constants";
import clsx from "clsx";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import {formatPhoneNumber} from "@/lib/phoneUtils";

interface Facility {
    fid: number;
    name: string;
}

interface Utility {
    uid: number;
    name: string;
}

export default function EditSchool() {
    const params = useParams();
    const schoolId = params.id;
    const {data, isLoading} = useGetSchoolQuery(Number(schoolId));
    const school = data?.data;
    const schoolStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(school?.status))?.label || undefined;
    const [form] = Form.useForm();

    useEffect(() => {
        if (school) {
            console.log("Loaded school data:", school);
            console.log("Raw imageList:", school.imageList);

            const facilityValues = school.facilities?.map(f => String(f.fid)) || [];
            const utilityValues = school.utilities?.map(u => String(u.uid)) || [];

            form.setFieldsValue({
                name: school.name || '',
                schoolType: String(school.schoolType),
                province: school.province || '',
                district: school.district || '',
                ward: school.ward || '',
                street: school.street || '',
                email: school.email || '',
                phone: formatPhoneNumber(school.phone),
                contryCode: formatPhoneNumber(school.phone,0),
                receivingAge: String(school.receivingAge),
                educationMethod: String(school.educationMethod),
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                facilities: facilityValues,
                utilities: utilityValues,
                description: school.description || '',
                website: school.website || '',
                image: school.imageList || []
            });
            const formValues = form.getFieldsValue();
            console.log("=====================form values: ",formValues)

        }
    }, [school, form, schoolStatus]);

    if (isLoading) {
        return (
            <>
                <MyBreadcrumb paths={[{label: 'School Management'}, {label: 'Edit school'}]}/>
                <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus!}/>
                <SchoolFormSkeleton/>
            </>
        );
    }

    return (
        <>
            <MyBreadcrumb
                paths={[
                    {label: 'School Management', href: '/admin/management/school/school-list'},
                    {label: 'Edit school'},
                ]}
            />
            <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus!}/>
            <SchoolForm
                form={form}
                hasCancelButton={true}
                hasUpdateSubmitButton={true}
                triggerCheckEmail={null}
                schoolId={Number(schoolId)}
            />
        </>
    );
}
