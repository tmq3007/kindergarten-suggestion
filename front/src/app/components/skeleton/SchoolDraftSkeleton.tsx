"use client";
import {Empty, Form, message} from "antd";
import SchoolForm from "@/app/components/school/SchoolFormForSchoolOwner"; // Đường dẫn đến file SchoolForm.tsx
import {
    useGetDraftOfSchoolOwnerQuery,
    useGetSchoolDraftOfSchoolOwnerQuery,
    useGetSchoolOfSchoolOwnerQuery
} from "@/redux/services/schoolOwnerApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatPhoneNumber } from "@/lib/util/phoneUtils";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    ROLES, SCHOOL_STATUS_OPTIONS,
} from "@/lib/constants";
import { useRouter } from "next/navigation";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import React, {useEffect} from "react";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormForSchoolOwnerSkeleton from "@/app/components/skeleton/SchoolFormForScchoolOwnerSkeleton";

export default function SchoolDraftSkeleton() {



    return (
        <div style={{ padding: "20px" }}>
            <MyBreadcrumb
                paths={[
                    {label: "Home", href: "/public"},
                    {label: "School Draft"},
                ]}
            />
            <SchoolManageTitle title={"School Draft"} schoolStatus={"is loading"}/>
            <SchoolFormForSchoolOwnerSkeleton

            />
        </div>
    );
}