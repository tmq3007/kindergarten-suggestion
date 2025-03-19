"use client";
import { Form, message } from "antd";
import SchoolForm from "@/app/components/school/SchoolFormForSchoolOwner"; // Đường dẫn đến file SchoolForm.tsx
import {useGetSchoolDraftOfSchoolOwnerQuery, useGetSchoolOfSchoolOwnerQuery } from "@/redux/services/schoolOwnerApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatPhoneNumber } from "@/lib/util/phoneUtils";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    ROLES,
} from "@/lib/constants";
import { useRouter } from "next/navigation";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import React, {useEffect} from "react";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";

export default function SchoolFormPreview() {
    const [form] = Form.useForm();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const role = user.role;
    const userId = user.id;

    // Check role user
    const unauthorized = () => {
        router.push("/login");
    };

    if (!role || role !== ROLES.SCHOOL_OWNER) {
        unauthorized();
        return null;
    }

    // Get school data by user id
    const { data, isError, isLoading } = useGetSchoolDraftOfSchoolOwnerQuery(Number(userId));
    console.log("data in SchoolFormPreview:", data);
    const school = data?.data;

    useEffect(() => {
        if (school) {
            console.log("school.imageList in SchoolFormPreview:", school.imageList);

            const validEducationMethod = EDUCATION_METHOD_OPTIONS.find(
                (opt) => opt.value === String(school.educationMethod)
            )?.value || "0";
            const validReceivingAge = CHILD_RECEIVING_AGE_OPTIONS.find(
                (opt) => opt.value === String(school.receivingAge)
            )?.value || "0";

            form.setFieldsValue({
                name: school.name || "",
                schoolType: school.schoolType != null ? String(school.schoolType) : "0",
                province: school.province || "",
                district: school.district || "",
                ward: school.ward || "",
                street: school.street || "",
                email: school.email || "",
                phone: formatPhoneNumber(school.phone || ""),
                website: school.website || "",
                receivingAge: validReceivingAge,
                educationMethod: validEducationMethod,
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                description: school.description || "",
                status: school.status || 0,
            });

            const facilityValues: string[] = school.facilities?.map((facility) => String(facility.fid)) || [];
            form.setFieldsValue({ facilities: facilityValues });

            const utilityValues: string[] = school.utilities?.map((utility) => String(utility.uid)) || [];
            form.setFieldsValue({ utilities: utilityValues });
        }
    }, [school, form]);

    useEffect(() => {
        if (isError) {
            message.error("Failed to load school details");
        }
    }, [isError]);

     const imageListFormatted = school?.imageList
        ? school.imageList.map((img: any) => ({
            url: img.url || img,
            filename: img.filename || "image.jpg",
        }))
        : [];

     if (isLoading) {
        return <div>Loading school data...</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <MyBreadcrumb
                paths={[
                    {label: "School Management", href: "/admin/management/school/school-list"},
                    {label: "School Detail"},
                ]}
            />
            <SchoolManageTitle title={"School details"}/>
            <SchoolForm
                form={form}
                isReadOnly={false}
                imageList={imageListFormatted}
                hasEditButton={true}
                hasSaveButton={true}
                hasCancelButton={true}
                hideImageUpload={true}
            />
        </div>
    );
}