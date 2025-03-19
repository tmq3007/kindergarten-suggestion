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
import SchoolDraftSkeleton from "@/app/components/skeleton/SchoolDraftSkeleton";
import NoData from "@/app/admin/management/school/rating-feedback/NoData";

export default function SchoolDraft() {
    const [form] = Form.useForm();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const role = useSelector((state: RootState) => state.user?.role);

    const hasDraft = user.hasDraft;
    console.log("hasDraft in SchoolFormPreview:", hasDraft);
    if (hasDraft===false) {
        return (
            <div className={'h-full flex items-center justify-center'}>
                <Empty/>
            </div>
        )
    }
    const {data, isLoading} = useGetSchoolDraftOfSchoolOwnerQuery(undefined,{
        skip: !hasDraft,
    });

    // Check role user
    const unauthorized = () => {
        router.push("/login");
    };

    if (!role || role !== ROLES.SCHOOL_OWNER) {
        unauthorized();
        return null;
    }

    // Get school data by user id
   // const { data, isError, isLoading } = useGetSchoolDraftOfSchoolOwnerQuery();
    console.log("data in SchoolFormPreview:", data);
    const school = data?.data;
    const draftStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(school?.status))?.label || undefined;

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

     const imageListFormatted = school?.imageList
        ? school.imageList.map((img: any) => ({
            url: img.url || img,
            filename: img.filename || "image.jpg",
        }))
        : [];

     if (isLoading) {
        return <div>

            <SchoolDraftSkeleton/>
        </div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <MyBreadcrumb
                paths={[
                    {label: "Home", href: "/public"},
                    {label: "School Draft"},
                ]}
            />
            <SchoolManageTitle title={"School Draft"} schoolStatus={draftStatus!}/>
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