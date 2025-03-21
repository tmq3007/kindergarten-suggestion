"use client";

import {Form} from "antd";
import {forbidden, useParams, useRouter} from "next/navigation";
import Link from "next/link";
import React from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import {ROLES, SCHOOL_STATUS} from "@/lib/constants";
import {useGetSchoolByIdQuery} from "@/redux/services/schoolApi";
import {RootState} from '@/redux/store';
import {useSelector} from "react-redux";
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";
import useSchoolForm from "@/lib/hook/useSchoolForm";

export default function SchoolDetail() {
    const params = useParams();
    const schoolId = Number(params.id as string);
    const router = useRouter();
    const {data, isError, isLoading} = useGetSchoolByIdQuery(schoolId);
    const user = useSelector((state: RootState) => state.user);
    const role = useSelector((state: RootState) => state.user?.role);
    const [form] = Form.useForm();
    const {school, schoolStatus} = useSchoolForm({
        data: data?.data,
        isLoading,
        externalForm: form,
    });

    // Check role and status
    if (role === ROLES.ADMIN && school?.status === SCHOOL_STATUS.Saved) {
        forbidden();
    }

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
        return <div>Can’t find any school</div>;
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

            {/*View Rating and Feedback Link*/}
            <div className="my-4 flex justify-end">
                <Link href={`/admin/management/school/rating-feedback/${schoolId}`}
                      className="text-blue-500 hover:underline">
                    View Rating & Feedback
                </Link>
            </div>

            <div className="read-only-form email-locked">
                <SchoolFormWrapper form={form} school={school}/>
            </div>
        </div>
    );
}