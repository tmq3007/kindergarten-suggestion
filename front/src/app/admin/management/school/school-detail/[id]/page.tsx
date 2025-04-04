"use client";

import {Form} from "antd";
import {forbidden, useParams} from "next/navigation";
import Link from "next/link";
import React from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import {ROLES, SCHOOL_STATUS} from "@/lib/constants";
import {useGetSchoolByIdQuery, useIsDraftQuery} from "@/redux/services/schoolApi";
import {RootState} from '@/redux/store';
import {useSelector} from "react-redux";
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";
import useSchoolForm from "@/lib/hook/useSchoolForm";

export default function SchoolDetail() {
    const params = useParams();
    const schoolId = Number(params.id as string);
    const {data: getSchoolData, isError, isLoading} = useGetSchoolByIdQuery(schoolId);
    const {data: isDraftData} = useIsDraftQuery(schoolId);
    const user = useSelector((state: RootState) => state.user);
    const role = useSelector((state: RootState) => state.user?.role);
    const [form] = Form.useForm();
    const {school, schoolStatus} = useSchoolForm({
        data: getSchoolData?.data,
        isLoading,
        externalForm: form,
    });
    const isDraft = isDraftData?.data;

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
            {
                !isDraft ?
                    <div className="my-4 flex justify-end">
                        <Link href={`/admin/management/school/rating-feedback/${schoolId}`}
                              className="text-blue-500 hover:underline">
                            View Rating & Feedback
                        </Link>
                    </div> :
                    <div className="my-4 flex justify-end">
                        <Link href={`/admin/management/school/school-detail/${schoolId}/diff`}
                              className="text-blue-500 hover:underline">
                            Show Different
                        </Link>
                    </div>
            }

            <div className="read-only-form email-locked">
                <SchoolFormWrapper form={form} school={school} isAdmin={true}/>
            </div>
        </div>
    );
}