'use client'
import {Empty, Form} from "antd";
import {forbidden} from "next/navigation";
import {useApproveSchoolMutation} from "@/redux/services/schoolApi";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    ROLES,
    SCHOOL_STATUS,
    SCHOOL_STATUS_OPTIONS
} from "@/lib/constants";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import React, {useEffect} from "react";
import {formatPhoneNumber} from "@/lib/util/phoneUtils";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";
import {useGetDraftOfSchoolOwnerQuery} from "@/redux/services/schoolOwnerApi";

export default function Draft() {
    const {data, isLoading} = useGetDraftOfSchoolOwnerQuery();
    const draft = data?.data;
    const draftStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(draft?.status))?.label || undefined;

    const [form] = Form.useForm();
    const user = useSelector((state: RootState) => state.user);
    const role = useSelector((state: RootState) => state.user?.role);

    const [approveSchool] = useApproveSchoolMutation();

    useEffect(() => {
        if (draft) {
            //assign value in string for education and receiving age
            const validEducationMethod = EDUCATION_METHOD_OPTIONS.find(opt => opt.value === String(draft.educationMethod))?.value || "0";
            const validReceivingAge = CHILD_RECEIVING_AGE_OPTIONS.find(opt => opt.value === String(draft.receivingAge))?.value || "0";

            form.setFieldsValue({
                name: draft.name || "",
                schoolType: draft.schoolType != null ? String(draft.schoolType) : "0",
                province: draft.province || "",
                district: draft.district || "",
                ward: draft.ward || "",
                street: draft.street || "",
                email: draft.email || "",
                phone: formatPhoneNumber(draft.phone),
                website: draft.website || "",
                receivingAge: validReceivingAge,
                educationMethod: validEducationMethod,
                feeFrom: draft.feeFrom || 0,
                feeTo: draft.feeTo || 0,
                description: draft.description || "",
                status: draft.status || 0,
            });

            //mapping facilities and utilities
            const facilityValues: string[] = draft.facilities?.map((facility) => String(facility.fid)) || [];
            form.setFieldsValue({facilities: facilityValues});

            const utilityValues: string[] = draft.utilities?.map((utility) => String(utility.uid)) || [];
            form.setFieldsValue({utilities: utilityValues});
        }
    }, [draft, form]);

    // Check role and status
    if (role === ROLES.ADMIN && draft?.status === SCHOOL_STATUS.Saved) {
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

    if (!user.hasDraft) {
        return (
            <div className={'h-full flex items-center justify-center'}>
                <Empty/>
            </div>
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
            <SchoolManageTitle title={"School details"} schoolStatus={draftStatus!}/>


            <div className="read-only-form email-locked">
                <SchoolFormWrapper form={form} school={draft!}/>
            </div>
        </div>
    );
}