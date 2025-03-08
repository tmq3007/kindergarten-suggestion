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
            console.log("Loaded school data:", school); // Debugging

            // Convert facilities to an array of values
            const facilityValues: string[] = school.facilities?.map((f: Facility) => String(f.fid)) || [];
            const utilityValues: string[] = school.utilities?.map((u: Utility) => String(u.uid)) || [];
            form.setFieldsValue({
                name: school.name || '',
                schoolType: String(school.schoolType),
                province: school.province || '',
                district: school.district || '',
                ward: school.ward || '',
                street: school.street || '',
                email: school.email || '',
                phone: school.phone || '',
                receivingAge: String(school.receivingAge),
                educationMethod: String(school.educationMethod),
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                facilities: facilityValues, // 🟢 Auto-check facilities
                utilities: utilityValues, // 🟢 Auto-check utilities
                description: school.description || '',
                website: school.website || ''
            });
        }
    }, [school, form]);

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
            <SchoolForm form={form} hasCancelButton={true} hasSubmitButton={true}/>
        </>
    );
}
