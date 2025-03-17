"use client";

import {Form, message} from "antd";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import closedImg from '@public/closed.png'
import {CHILD_RECEIVING_AGE_OPTIONS, EDUCATION_METHOD_OPTIONS, ROLES, SCHOOL_STATUS_OPTIONS,} from "@/lib/constants";
import {useApproveSchoolMutation} from "@/redux/services/schoolApi";
import {useSelector} from "react-redux";
import {RootState} from '@/redux/store';
import Image from "next/image";
import {formatPhoneNumber} from "@/lib/util/phoneUtils";
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";
import {useGetSchoolOfSchoolOwnerQuery} from "@/redux/services/schoolOwnerApi";

export default function SchoolDetail() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const role = user.role;
    console.log("****************")
    console.log(user)
    //Check role user
    const unauthorized = () => {
        router.push("/login");
    };

    if (!role || role !== ROLES.SCHOOL_OWNER) {
        unauthorized();
        return null;
    }

    //get school by user id
    const {data, isError, isLoading} = useGetSchoolOfSchoolOwnerQuery({
        name: undefined,
    });

    const school = data?.data;
    const schoolStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(school?.status))?.label || undefined;
    const [form] = Form.useForm();

    const [approveSchool] = useApproveSchoolMutation();

    useEffect(() => {
        if (school) {
            console.log('school.imageList in SchoolDetail:', school.imageList);

            const validEducationMethod = EDUCATION_METHOD_OPTIONS.find(opt => opt.value === String(school.educationMethod))?.value || "0";
            const validReceivingAge = CHILD_RECEIVING_AGE_OPTIONS.find(opt => opt.value === String(school.receivingAge))?.value || "0";

            form.setFieldsValue({
                name: school.name || "",
                schoolType: school.schoolType != null ? String(school.schoolType) : "0",
                province: school.province || "",
                district: school.district || "",
                ward: school.ward || "",
                street: school.street || "",
                email: school.email || "",
                phone: formatPhoneNumber(school.phone),
                website: school.website || "",
                receivingAge: validReceivingAge,
                educationMethod: validEducationMethod,
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                description: school.description || "",
                status: school.status || 0,
            });

            const facilityValues: string[] = school.facilities?.map((facility) => String(facility.fid)) || [];
            form.setFieldsValue({facilities: facilityValues});

            const utilityValues: string[] = school.utilities?.map((utility) => String(utility.uid)) || [];
            form.setFieldsValue({utilities: utilityValues});
        }
    }, [school, form]);

    useEffect(() => {
        if (isError) {
            message.error("Failed to load school details");
        }
    }, [isError, router]);

    if (isLoading) {
        return (
            <div className="pt-2">
                <MyBreadcrumb
                    paths={[
                        {label: "School Management", href: "/admin/management/school/school-list"},
                        {label: "School Detail"},
                    ]}
                />
                <SchoolManageTitle title={"School details"}/>
                <SchoolFormSkeleton/>
            </div>
        );
    }

    if (!school) {
        return (
            <>
                <Image src={closedImg} alt={'school-not-found'}/>
            </>
        )
    }

    return (
        <div className="pt-2">
            <MyBreadcrumb
                paths={[
                    {label: "School Management", href: "/admin/management/school/school-list"},
                    {label: "School Detail"},
                ]}
            />
            <SchoolManageTitle title={"School details"} schoolStatus={schoolStatus!}/>

            <div className="read-only-form email-locked">
                <SchoolFormWrapper form={form} school={school}/>
            </div>
        </div>
    );
}