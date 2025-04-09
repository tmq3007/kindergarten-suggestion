"use client";

import {forbidden, useParams, useRouter} from "next/navigation";
import React from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import RequestCounsellingForm from "@/app/components/request_counselling/RequestCounsellingForm";
import {
    useGetRequestCounsellingByAdminQuery,
    useGetRequestCounsellingBySchoolOwnerQuery
} from "@/redux/services/requestCounsellingApi";
import useRequestCounsellingForm from "@/lib/hook/useRequestCounsellingForm";
import RequestCounsellingManageTitle from "@/app/components/request_counselling/RequestCounsellingManageTitle";
import RequestCounsellingFormSkeleton from "@/app/components/skeleton/RequestCounsellingFormSkeleton";

export default function RequestCounsellingDetail() {
    const params = useParams();
    const requestCounsellingId = Number(params.id as string);
    const router = useRouter();
    const {data, isLoading} = useGetRequestCounsellingBySchoolOwnerQuery(requestCounsellingId);
    const {form, formLoaded, requestCounselling, requestCounsellingStatus} = useRequestCounsellingForm({
        data: data?.data,
        isLoading
    });

    if (isLoading) {
        return (
            <div className="pt-2">
                <MyBreadcrumb
                    paths={[
                        {label: "Request Management"},
                        {label: "Request Detail"},
                    ]}
                />
                <RequestCounsellingManageTitle title={"Request details"} requestCounsellingStatus={requestCounsellingStatus || 'Loading...'}/>
                <RequestCounsellingFormSkeleton/>
            </div>
        );
    }

    if (!requestCounselling) {
        forbidden();
    }

    return (
        <div className="pt-2">
            <MyBreadcrumb
                paths={[
                    {label: "Request Management", href: "/public/school-owner/view-request"},
                    {label: "Request Detail"},
                ]}
            />
            <RequestCounsellingManageTitle title={"Request details"} requestCounsellingStatus={requestCounsellingStatus!}/>

            {(requestCounsellingStatus === 'Closed' && (
                <div className="read-only-form email-locked">
                    <RequestCounsellingForm
                        form={form}
                        formLoaded={formLoaded}
                        isReadOnly={true}
                        hasResolveButton={false}
                        isAdmin={false}/>

                </div>
            ) ||
                <div className="read-only-form email-locked">
                    <RequestCounsellingForm
                        form={form}
                        formLoaded={formLoaded}
                        isReadOnly={true}
                        hasResolveButton={true}
                        isAdmin={false}/>
                </div>)}
        </div>
    );
}