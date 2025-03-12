"use client";

import {Form, message} from "antd";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import SchoolForm from "@/app/components/school/SchoolForm";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import closedImg from '@public/closed.png'
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    SCHOOL_STATUS,
    SCHOOL_STATUS_OPTIONS,
    ROLES,
} from "@/lib/constants";
import {useApproveSchoolMutation, useGetSchoolByUserIdQuery} from "@/redux/services/schoolApi";
import {useSelector} from "react-redux";
import {RootState} from '@/redux/store';
import Image from "next/image";
import {formatPhoneNumber} from "@/lib/phoneUtils";

export default function SchoolDetail() {
    const router = useRouter();
    const role = useSelector((state: RootState) => state.user?.role);

    // Kiểm tra vai trò người dùng
    const unauthorized = () => {
        router.push("/login");
    };

    if (!role || role !== ROLES.SCHOOL_OWNER) {
        unauthorized();
        return null;
    }

    // Sử dụng useGetSchoolByUserIdQuery để lấy một trường học duy nhất
    const {data, isError, isLoading} = useGetSchoolByUserIdQuery({
        name: undefined,
    });

    // Dữ liệu giờ là một SchoolDetailVO trực tiếp
    const school = data?.data;
    const schoolStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(school?.status))?.label || undefined;
    const [form] = Form.useForm();

    const [approveSchool] = useApproveSchoolMutation();

    useEffect(() => {
        if (school) {
            console.log('school.imageList in SchoolDetail:', school.imageList);

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

            const facilityValues: string[] = school.facilities?.map((facility) => String(facility.fid)) || [];
            form.setFieldsValue({facilities: facilityValues});

            const utilityValues: string[] = school.utilities?.map((utility) => String(utility.uid)) || [];
            form.setFieldsValue({utilities: utilityValues});
        }
    }, [school, form]);

    useEffect(() => {
        if (isError) {
            message.error("Failed to load school details");
        }
    }, [isError, router]);

    const handleDelete = async () => {
        if (!school?.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/school/${school.id}`, {
                method: "DELETE",
                headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`},
            });
            if (response.ok) {
                message.success("School deleted successfully");
                router.push("/admin/management/school/school-list");
            } else {
                message.error("Failed to delete school");
            }
        } catch (error) {
            message.error("Error deleting school");
        }
    };

    const handleReject = async () => {
        if (!school?.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/school/${school.id}/reject`, {
                method: "PUT",
                headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`},
            });
            if (response.ok) {
                message.success("School rejected successfully");
                router.refresh();
            } else {
                message.error("Failed to reject school");
            }
        } catch (error) {
            message.error("Error rejecting school");
        }
    };

    const handleApprove = async () => {
        if (!school?.id) return;
        try {
            await approveSchool(school.id).unwrap();
            message.success("School approved successfully");
        } catch (error) {
            message.error("Error approving school");
        }
    };

    const handlePublish = async () => {
        if (!school?.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/school/${school.id}/publish`, {
                method: "PUT",
                headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`},
            });
            if (response.ok) {
                message.success("School published successfully");
                router.refresh();
            } else {
                message.error("Failed to publish school");
            }
        } catch (error) {
            message.error("Error publishing school");
        }
    };

    const handleUnpublish = async () => {
        if (!school?.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/school/${school.id}/unpublish`, {
                method: "PUT",
                headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`},
            });
            if (response.ok) {
                message.success("School unpublished successfully");
                router.refresh();
            } else {
                message.error("Failed to unpublish school");
            }
        } catch (error) {
            message.error("Error unpublishing school");
        }
    };

    const handleSave = async () => {
        if (!school?.id) return;
        try {
            const values = await form.validateFields();
            const response = await fetch(`http://localhost:8080/api/school/${school.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(values),
            });
            if (response.ok) {
                message.success("School saved successfully");
                router.refresh();
            } else {
                message.error("Failed to save school");
            }
        } catch (error) {
            message.error("Error saving school");
        }
    };

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
        return (
            <>
                <Image src={closedImg} alt={'school-not-found'}/>
            </>
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
            <SchoolManageTitle title={"School details"} schoolStatus={schoolStatus!}/>

            <div className="read-only-form email-locked">
                <SchoolForm
                    isReadOnly={true}
                    form={form}
                    hideImageUpload={true}
                    imageList={school.imageList || []}
                    hasCancelButton={false}
                    hasDeleteButton={
                        school.status === SCHOOL_STATUS.Submitted ||
                        school.status === SCHOOL_STATUS.Published ||
                        school.status === SCHOOL_STATUS.Unpublished
                    }
                    hasEditButton={
                        school.status === SCHOOL_STATUS.Submitted ||
                        school.status === SCHOOL_STATUS.Approved ||
                        school.status === SCHOOL_STATUS.Published ||
                        school.status === SCHOOL_STATUS.Unpublished
                    }
                    hasRejectButton={school.status === SCHOOL_STATUS.Submitted}
                    hasApproveButton={school.status === SCHOOL_STATUS.Submitted}
                    hasPublishButton={
                        school.status === SCHOOL_STATUS.Approved ||
                        school.status === SCHOOL_STATUS.Unpublished
                    }
                    hasUnpublishButton={school.status === SCHOOL_STATUS.Published}
                />
            </div>
        </div>
    );
}