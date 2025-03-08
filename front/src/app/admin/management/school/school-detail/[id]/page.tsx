"use client";

import { Badge, Button, message, Form, Skeleton } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
    useGetSchoolByIdQuery,
    useApproveSchoolMutation,
} from "@/redux/services/schoolListApi";
import SchoolForm from "@/app/components/school/SchoolForm";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { nunito } from "@/lib/fonts";

export default function SchoolDetail() {
    const params = useParams();
    const schoolId = Number(params.id as string);
    const router = useRouter();
    const { data, isError, isLoading } = useGetSchoolByIdQuery(schoolId);
    const school = data?.data;
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

    const getStatusText = (status: number) => {
        switch (status) {
            case 0: return "Saved";
            case 1: return "Submitted";
            case 2: return "Approved";
            case 3: return "Rejected";
            case 4: return "Published";
            case 5: return "Unpublished";
            case 6: return "Deleted";
            default: return "Unknown";
        }
    };

    // Xử lý hiển thị nút dựa trên status
    const renderActionButtons = () => {
        if (!school) return null;

        const status = school.status;

        return (
            <>
                <Button danger onClick={handleDelete} style={{ margin: '0 8px' }}>
                    Delete
                </Button>
                <Link href={`/admin/management/school/edit-school?schoolId=${schoolId}`}>
                    <Button type="primary" style={{ margin: '0 8px' }}>
                        Edit
                    </Button>
                </Link>
                {status === 0 && (
                    <Button type="primary" onClick={handleSave} style={{ margin: '0 8px' }}>
                        Save
                    </Button>
                )}
                {status === 1 || status === 2 ? (
                    <>
                        <Button danger onClick={handleReject} style={{ margin: '0 8px' }}>
                            Reject
                        </Button>
                        <Button type="primary" onClick={handleApprove} style={{ margin: '0 8px' }}>
                            Approve
                        </Button>
                    </>
                ) : status === 4 ? (
                    <Button type="primary" onClick={handleUnpublish} style={{ margin: '0 8px' }}>
                        Unpublish
                    </Button>
                ) : status === 5 ? (
                    <Button type="primary" onClick={handlePublish} style={{ margin: '0 8px' }}>
                        Publish
                    </Button>
                ) : null}
            </>
        );
    };

    if (isLoading) {
        return (
            <div className="pt-2">
                <MyBreadcrumb
                    paths={[
                        { label: "School Management" },
                        { label: "School Detail" },
                    ]}
                />
                <div className="flex items-center m-6">
                    <span className={`${nunito.className} text-3xl font-bold mr-6`}>School Detail</span>
                    <Skeleton.Button active shape="round" />
                </div>
                <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
                    <Skeleton active paragraph={{ rows: 10 }} />
                </div>
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
                    { label: "School Management" },
                    { label: "School Detail" },
                ]}
            />
            <div className="flex items-center m-6">
                <span className={`${nunito.className} text-3xl font-bold mr-6`}>School Detail</span>
                <Badge className="h-1/2 bg-red-500 py-2 px-5 rounded-xl">
                    {getStatusText(school.status)}
                </Badge>
            </div>

            <div className="read-only-form">
                <SchoolForm
                    form={form}
                    hasSubmitButton={false} // Không hiển thị Submit
                    hideImageUpload={true}
                    imageList={school.imageList || []}
                    actionButtons={renderActionButtons()} // Truyền các nút hành động vào form
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