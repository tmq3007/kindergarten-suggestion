"use client";

import { Badge, Button, message, Form, Image } from "antd"; // Thêm Image từ antd
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
    useGetSchoolByIdQuery,
    useApproveSchoolMutation,
} from "@/redux/services/schoolListApi";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
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

    if (isLoading) {
        return <SchoolFormSkeleton />;
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
                <SchoolForm form={form} hasSubmitButton={false} />
            </div>

            {/* Hiển thị danh sách hình ảnh */}
            {school.imageList && school.imageList.length > 0 && (
                <div className="m-6">
                    <h3 className={`${nunito.className} text-xl font-bold mb-4`}>School Images</h3>
                    <div className="flex flex-wrap gap-4">
                        {school.imageList.map((image, index) => (
                            <div key={index} className="w-48">
                                <Image
                                    src={image.url}
                                    alt={image.filename || `Image ${index + 1}`}
                                    width={200}
                                    height={200}
                                    className="object-cover rounded-lg"
                                    preview // Cho phép xem trước hình ảnh khi click
                                />
                                <p className="text-sm text-gray-500 mt-1 truncate">{image.filename}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
<img alt={'d'} src={'https://drive.google.com/uc?export=view&id=1coklRtpsxoLP2mTb_XEAupCOERKCuof2'}/>
            <div className="flex justify-end space-x-4 m-6">
                <Button danger onClick={handleDelete}>
                    Xóa
                </Button>
                <Link href={`/admin/management/school/edit-school?schoolId=${schoolId}`}>
                    <Button type="primary">Sửa</Button>
                </Link>
                <Button danger onClick={handleReject}>
                    Từ chối
                </Button>
                <Button type="primary" onClick={handleApprove}>
                    Phê duyệt
                </Button>
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
            `}</style>
        </div>
    );
}