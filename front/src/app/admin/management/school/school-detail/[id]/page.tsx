"use client";

import {Form} from "antd";
import {forbidden, useParams, useRouter} from "next/navigation";
import Link from "next/link";
import React, {useEffect} from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    ROLES,
    SCHOOL_STATUS,
    SCHOOL_STATUS_OPTIONS
} from "@/lib/constants";
import {useApproveSchoolMutation, useGetSchoolByIdQuery} from "@/redux/services/schoolApi";
import {RootState} from '@/redux/store';
import {useSelector} from "react-redux";
import {formatPhoneNumber} from "@/lib/util/phoneUtils";
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";

export default function SchoolDetail() {
    const params = useParams();
    const schoolId = Number(params.id as string);
    const router = useRouter();
    const { data, isError, isLoading } = useGetSchoolByIdQuery(schoolId);
    const school = data?.data;
    const schoolStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(school?.status))?.label || undefined;
    const [form] = Form.useForm();
    const user = useSelector((state: RootState) => state.user);
    const role = useSelector((state: RootState) => state.user?.role);

    const [approveSchool] = useApproveSchoolMutation();

    useEffect(() => {
        if (school) {
            console.log('school.imageList in SchoolDetail:', school.imageList);

            //assign value in string for education and receiving age
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

            //mapping facilities and utilities
            const facilityValues: string[] = school.facilities?.map((facility) => String(facility.fid)) || [];
            form.setFieldsValue({ facilities: facilityValues });

            const utilityValues: string[] = school.utilities?.map((utility) => String(utility.uid)) || [];
            form.setFieldsValue({ utilities: utilityValues });
        }
    }, [school, form]);

    // Check role and status
    if (role === ROLES.ADMIN && school?.status === SCHOOL_STATUS.Saved) {
        forbidden();
    }

    if (isLoading) {
        return (
            <div className="pt-2">
                <MyBreadcrumb
                    paths={[
                        { label: "School Management", href: "/admin/management/school/school-list" },
                        { label: "School Detail" },
                    ]}
                />
                <SchoolManageTitle title={"School details"} />
                <SchoolFormSkeleton />
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
                    { label: "School Management", href: "/admin/management/school/school-list" },
                    { label: "School Detail" },
                ]}
            />
            <SchoolManageTitle title={"School details"} schoolStatus={schoolStatus!} />

            {/*View Rating and Feedback Link*/}
            <div className="my-4 flex justify-end">
                <Link href={`/admin/management/school/rating-feedback/${schoolId}`} className="text-blue-500 hover:underline">
                    View Rating & Feedback
                </Link>
            </div>

            <div className="read-only-form email-locked">
                <SchoolFormWrapper form={form} school={school}/>
            </div>
        </div>
    );
}