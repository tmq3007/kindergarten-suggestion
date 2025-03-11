"use client";

import { Form, message } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import SchoolForm from "@/app/components/school/SchoolForm";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    SCHOOL_STATUS,
    SCHOOL_STATUS_OPTIONS
} from "@/lib/constants";
import { useApproveSchoolMutation, useGetSchoolListByUserIdQuery } from "@/redux/services/schoolApi";
import { useSelector } from "react-redux";
import {RootState} from '@/redux/store';
import {ROLES} from '@/lib/constants';

export default function SchoolDetail() {
    const router = useRouter();
    const userId = useSelector((state: RootState) => Number(state.user?.id));
    const user = useSelector((state: RootState) => state.user);
    const role = useSelector((state: RootState) => state.user?.role);

    // Kiểm tra vai trò người dùng
    const unauthorized = () => {
        message.error("Unauthorized access");
        router.push("/login"); // Hoặc trang khác tùy yêu cầu
    };

    if (!role || role !== ROLES.SCHOOL_OWNER) {
        unauthorized();
        return null; // Ngăn render tiếp nếu không có quyền
    }

    // Sử dụng useGetSchoolListByUserIdQuery để lấy danh sách trường theo userId
    const { data, isError, isLoading } = useGetSchoolListByUserIdQuery({
        userId: userId!,
        page: 1, // Trang đầu tiên
        size: 10, // Kích thước trang, điều chỉnh theo nhu cầu
    });

    // Lấy trường học đầu tiên từ danh sách (hoặc theo logic khác nếu cần)
    const school = data?.data?.content[0]; // Giả định lấy trường đầu tiên
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
                phone: school.phone || "",
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
            router.push("/admin/management/school/school-list");
        }
    }, [isError, router]);

    const handleDelete = async () => {
        if (!school?.id) return;
        try {
            const response = await fetch(`http://localhost:8080/api/school/${school.id}`, {
                method: "DELETE",
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
                headers: { "Content-Type": "application/json" },
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
                        { label: "School Management", href: "/admin/management/school/school-list" },
                        { label: "Add new school" },
                    ]}
                />
                <SchoolManageTitle title={"School details"} />
                <SchoolFormSkeleton />
            </div>
        );
    }

    if (!school) {
        return <div>Can’t find any school for this user</div>;
    }

    return (
        <div className="pt-2">
            <MyBreadcrumb
                paths={[
                    { label: "School Management", href: "/admin/management/school/school-list" },
                    { label: "Add new school" },
                ]}
            />
            <SchoolManageTitle title={"School details"} schoolStatus={schoolStatus!} />

            <div className="read-only-form email-locked">
                <SchoolForm
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

            <style jsx>{`
                .read-only-form :global(.ant-input),
                .read-only-form :global(.ant-select),
                .read-only-form :global(.ant-checkbox),
                .read-only-form :global(.ant-upload),
                .read-only-form :global(.ant-input-number),
                .read-only-form :global(.ant-checkbox-wrapper) {
                    pointer-events: none !important;
                }

                .email-locked :global(.ant-form-item:has(> .ant-form-item-label > label[title="Email Address"]) .ant-input) {
                    pointer-events: none !important;
                    user-select: none !important;
                    cursor: not-allowed !important;
                    background-color: #fff !important;
                }

                .email-locked :global(.my-editor) {
                    pointer-events: none !important;
                    user-select: none !important;
                    cursor: not-allowed !important;
                }

                .read-only-form :global(.ant-select-selector) {
                    background-color: #fff !important;
                }

                .read-only-form :global(.ant-checkbox-input) {
                    pointer-events: none !important;
                }

                .read-only-form :global(a) {
                    pointer-events: none;
                    color: #999 !important;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}