"use client";

import {Form, message} from "antd";
import {useParams, useRouter} from "next/navigation";
import React, {useEffect} from "react";
import {useApproveSchoolMutation, useGetSchoolByIdQuery,} from "@/redux/services/schoolListApi";
import SchoolForm from "@/app/components/school/SchoolForm";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import {SCHOOL_STATUS, SCHOOL_STATUS_OPTIONS} from "@/lib/constants";
import SchoolFormButton from "@/app/components/school/SchoolFormButton";

export default function SchoolDetail() {
    const params = useParams();
    const schoolId = Number(params.id as string);
    const router = useRouter();
    const {data, isError, isLoading} = useGetSchoolByIdQuery(schoolId);
    const school = data?.data;
    const schoolStatus = SCHOOL_STATUS_OPTIONS.find(s => s.value === String(school?.status))?.label || undefined;
    const [form] = Form.useForm();

    const [approveSchool] = useApproveSchoolMutation();

    useEffect(() => {
        if (school) {
            console.log('school.imageList in SchoolDetail:', school.imageList); // Log để kiểm tra dữ liệu
            form.setFieldsValue({
                name: school.name || "",
                schoolType: school.schoolType != null ? school.schoolType : 0,
                province: school.province || "",
                district: school.district || "",
                ward: school.ward || "",
                street: school.street || "",
                email: school.email || "",
                phone: school.phone || "",
                receivingAge: school.receivingAge != null ? school.receivingAge : 0,
                educationMethod: school.educationMethod != null ? school.educationMethod : 0,
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
            router.push("/admin/management/school/school-list");
        }
    }, [isError, router]);

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/school/${schoolId}`, {
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
        try {
            const response = await fetch(`http://localhost:8080/api/school/${schoolId}/reject`, {
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
        try {
            await approveSchool(schoolId).unwrap();
            message.success("School approved successfully");
        } catch (error) {
            message.error("Error approving school");
        }
    };

    const handlePublish = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/school/${schoolId}/publish`, {
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
        try {
            const response = await fetch(`http://localhost:8080/api/school/${schoolId}/unpublish`, {
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
        try {
            // Thêm logic lưu form nếu cần (giả định gọi API để lưu)
            const values = await form.validateFields();
            const response = await fetch(`http://localhost:8080/api/school/${schoolId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
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
                        {label: 'School Management', href: '/admin/management/school/school-list'},
                        {label: 'Add new school'},
                    ]}
                />
                <SchoolManageTitle title={'School details'}/>
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
                    {label: 'School Management', href: '/admin/management/school/school-list'},
                    {label: 'Add new school'},
                ]}
            />
            <SchoolManageTitle title={'School details'} schoolStatus={schoolStatus!}/>

            <div className="read-only-form">
                <SchoolForm
                    form={form}
                    hideImageUpload={true}
                    imageList={school.imageList || []}
                    hasCancelButton={false}
                    hasDeleteButton={school.status === SCHOOL_STATUS.Submitted ||
                        school.status === SCHOOL_STATUS.Published ||
                        school.status === SCHOOL_STATUS.Unpublished}

                    hasEditButton={school.status === SCHOOL_STATUS.Submitted ||
                        school.status === SCHOOL_STATUS.Approved ||
                        school.status === SCHOOL_STATUS.Published ||
                        school.status === SCHOOL_STATUS.Unpublished}

                    hasRejectButton={school.status === SCHOOL_STATUS.Submitted}

                    hasApproveButton={school.status === SCHOOL_STATUS.Submitted}

                    hasPublishButton={school.status === SCHOOL_STATUS.Approved ||
                        school.status === SCHOOL_STATUS.Unpublished}

                    hasUnpublishButton={school.status === SCHOOL_STATUS.Published}
                />
            </div>

            <style jsx>{`
                .read-only-form :global(.ant-input),
                .read-only-form :global(.ant-select),
                .read-only-form :global(.ant-checkbox),
                .read-only-form :global(.ant-upload),
                .read-only-form :global(.ant-input-number) {
                    pointer-events: none;
                    background-color: #f5f5f5;
                }

                .read-only-form :global(.ant-select-selector) {
                    background-color: #f5f5f5 !important;
                }

                .read-only-form :global(.ant-checkbox-input) {
                    pointer-events: none;
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