"use client";

import {Form} from "antd";
import {forbidden, useParams, useRouter} from "next/navigation";
import Link from "next/link";
import React from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import {ROLES, SCHOOL_STATUS, SCHOOL_STATUS_OPTIONS} from "@/lib/constants";
import {useGetSchoolByIdQuery} from "@/redux/services/schoolApi";
import {RootState} from '@/redux/store';
import {useSelector} from "react-redux";
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";
import RequestCounsellingForm from "@/app/components/request_counselling/RequestCounsellingForm";
import {useGetRequestCounsellingQuery} from "@/redux/services/requestCounsellingApi";
import useRequestCounsellingForm from "@/lib/hook/useRequestCounsellingForm";


export default function RequestCounsellingDetail() {
    const params = useParams();
    const requestCounsellingId = Number(params.id as string);
    const router = useRouter();
    const {data, isLoading} = useGetRequestCounsellingQuery(requestCounsellingId);
    const {form, formLoaded, requestCounselling} = useRequestCounsellingForm({
        data: data?.data,
        isLoading
    });


    // Check role and status
    // if (role === ROLES.ADMIN && school?.status === SCHOOL_STATUS.Saved) {
    //     forbidden();
    // }

    // if (isLoading) {
    //     return (
    //         <div className="pt-2">
    //             <MyBreadcrumb
    //                 paths={[
    //                     {label: "School Management", href: "/admin/management/school/school-list"},
    //                     {label: "School Detail"},
    //                 ]}
    //             />
    //             <SchoolManageTitle title={"School details"}/>
    //             <SchoolFormSkeleton/>
    //         </div>
    //     );
    // }

    // if (!school) {
    //     return <div>Can’t find any school</div>;
    // }

    return (
        <div className="pt-2">
            <MyBreadcrumb
                paths={[
                    {label: "School Management", href: "/admin/management/school/school-list"},
                    {label: "School Detail"},
                ]}
            />
            {/*<SchoolManageTitle title={"School details"} schoolStatus={schoolStatus!}/>*/}

            <div className="read-only-form email-locked">
                <RequestCounsellingForm
                    form={form}
                    formLoaded={formLoaded}/>
            </div>
        </div>
    );
}