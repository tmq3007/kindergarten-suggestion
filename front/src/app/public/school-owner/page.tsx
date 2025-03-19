"use client";

import {Empty, Form, message} from "antd";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import {ROLES, SCHOOL_STATUS_OPTIONS,} from "@/lib/constants";
import {useSelector} from "react-redux";
import {RootState} from '@/redux/store';
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";
import {useGetSchoolOfSchoolOwnerQuery} from "@/redux/services/schoolOwnerApi";
import {useSchoolFormSetup} from "@/lib/hook/useSchoolFormSetup";

export default function SchoolDetail() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const role = user.role;
    const hasSchool = user.hasSchool;

    if (!hasSchool) {
        return (
            <div className={'h-full flex items-center justify-center'}>
                <Empty/>
            </div>
        )
    }

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
    const {data, isError, isLoading} = useGetSchoolOfSchoolOwnerQuery(undefined, {
        skip: !hasSchool,
    });

    const school = data?.data;
    const schoolStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(school?.status))?.label || undefined;
    const [form] = Form.useForm();

    useSchoolFormSetup(school, form);

    useEffect(() => {
        if (isError) {
            message.error("Failed to load school details").then(r => {
            });
        }
    }, [isError, router]);

    if (isLoading) {
        return (
            <div className="pt-2">
                <MyBreadcrumb
                    paths={[
                        {label: "My School"},
                        {label: "School Detail"},
                    ]}
                />
                <SchoolManageTitle title={"School details"}/>
                <SchoolFormSkeleton/>
            </div>
        );
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
                <SchoolFormWrapper form={form} school={school!}/>
            </div>
        </div>
    );
}