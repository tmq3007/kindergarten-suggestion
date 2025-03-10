import {Button, message, UploadFile} from "antd";
import React, {useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import {
    SchoolDTO,
    SchoolUpdateDTO,
    useAddSchoolMutation,
    useUpdateSchoolByAdminMutation, useUpdateSchoolStatusByAdminMutation,
} from "@/redux/services/schoolApi";
import {ButtonGroupProps} from "@/app/components/school/SchoolFormButton";
import countriesKeepZero from "@/lib/countriesKeepZero";
import {useGetSchoolByIdQuery} from "@/redux/services/schoolListApi";

const SchoolFormButtonForAdmin: React.FC<ButtonGroupProps> = ({
                                                                  form,
                                                                  hasCancelButton,
                                                                  hasSaveButton,
                                                                  hasCreateSubmitButton,
                                                                  hasUpdateSubmitButton,
                                                                  hasDeleteButton,
                                                                  hasEditButton,
                                                                  hasRejectButton,
                                                                  hasApproveButton,
                                                                  hasPublishButton,
                                                                  hasUnpublishButton,
                                                                  selectedCountry,
                                                              }) => {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.id;
    const [updateSchoolByAdmin, {isLoading: isUpdating}] = useUpdateSchoolByAdminMutation();
    const [addSchool, {isLoading: isCreating}] = useAddSchoolMutation();
    const [updateSchoolStatusByAdmin, {isLoading: isUpdatingStatus}] = useUpdateSchoolStatusByAdminMutation();
    const {refetch} = useGetSchoolByIdQuery(Number(schoolId));
    const [messageApi, contextHolder] = message.useMessage();
    /**
     * Utility function to prepare school data before submission
     * - Validates form fields
     * - Formats phone number correctly
     * - Extracts uploaded images
     */
    const prepareSchoolData = async (): Promise<SchoolDTO | SchoolUpdateDTO | null> => {
        try {
            // Validate form fields and get values
            const values = await form.validateFields();

            // Format phone number
            let formattedPhone = values.phone || "";
            if (selectedCountry && !countriesKeepZero.includes(selectedCountry.dialCode) && formattedPhone.startsWith("0")) {
                formattedPhone = formattedPhone.substring(1);
            }
            const fullPhoneNumber = selectedCountry ? `${selectedCountry.dialCode} ${formattedPhone}` : formattedPhone;

            // Extract uploaded images
            const fileList: File[] = (values.image || [])
                .filter((file: UploadFile) => file.originFileObj)
                .map((file: UploadFile) => file.originFileObj as File);

            // Return the prepared data object
            return {
                ...values,
                image: fileList,
                phone: fullPhoneNumber,
            };
        } catch (error) {
            console.error("Form validation failed:", error);
            return null; // Return null if validation fails
        }
    };

    /**
     * Handles school creation
     */
    const handleCreateSubmit = async () => {
        const schoolData = await prepareSchoolData();
        if (!schoolData) return;
        try {
            await addSchool({...schoolData, status: 1}).unwrap();
            messageApi.success("School created successfully!");
        } catch (error) {
            messageApi.error("Failed to create school. Please try again.");
        }
    };

    /**
     * Handles school update
     */
    const handleUpdateSubmit = async () => {
        const schoolData = await prepareSchoolData();
        if (!schoolData) return;
        try {
            await updateSchoolByAdmin({ id: Number(schoolId), ...schoolData }).unwrap();
            messageApi.success('School updated successfully!');
            refetch();
        } catch (error) {
            messageApi.error("Failed to update school. Please try again.");
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handlePublish = async () => {
        try {
            await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 4 } }).unwrap();
            messageApi.success('School published successfully!');
            refetch();
        } catch (error) {
            messageApi.error("Failed to publish school. Please try again.");
        }
    };
    const handleUnpublish = async () => {
        try {
            await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 5 } }).unwrap();
            messageApi.success('School unpublished successfully!');
            refetch();
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
    };
    const handleDelete = async () => {
        try {
            await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 6 } }).unwrap();
            messageApi.success('School deleted successfully!')
        } catch (error) {
            messageApi.error("Failed to delete school. Please try again.");
        }
    };
    const handleApprove = async () => {
        try {
            await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 2 } }).unwrap();
            messageApi.success('School approved successfully!');
            refetch();
        } catch (error) {
            messageApi.error("Failed to approve school. Please try again.");
        }
    };
    const handleReject = async () => {
        try {
            await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 3 } }).unwrap();
            messageApi.success('School rejected successfully!');
            refetch();
        } catch (error) {
            messageApi.error("Failed to reject school. Please try again.");
        }
    };
    const handleEdit = () => {
        router.push(`/admin/management/school/edit-school/${schoolId}`);
    };

    return (
        <div className="flex lg:justify-center space-x-4 justify-end">
            {contextHolder}
            {hasCancelButton && (
                <Button htmlType="button" onClick={handleCancel} className={'bg-red-500 text-white border-red-900'}>
                    Cancel
                </Button>
            )}
            {hasSaveButton && (
                <Button htmlType="button" onClick={() => {
                }} className={'bg-gray-300 text-gray-800 border-gray-900'}>
                    Save
                </Button>
            )}
            {hasCreateSubmitButton && (
                <Button htmlType="button" onClick={handleCreateSubmit}
                        className={'bg-blue-300 text-blue-800 border-blue-900'} loading={isCreating}>
                    Submit
                </Button>
            )}
            {hasUpdateSubmitButton && (
                <Button htmlType="button" onClick={handleUpdateSubmit}
                        className={'bg-blue-300 text-blue-800 border-blue-900'} loading={isUpdating}>
                    Submit
                </Button>
            )}
            {hasDeleteButton && (
                <Button htmlType="button" onClick={handleDelete}
                        className={'bg-orange-300 text-orange-800 border-orange-900'}>
                    Delete
                </Button>
            )}
            {hasEditButton && (
                <Button htmlType="button" onClick={handleEdit} className={'bg-blue-300 text-blue-800 border-blue-900'}>
                    Edit
                </Button>
            )}
            {hasRejectButton && (
                <Button htmlType="button" onClick={handleReject} className={'bg-red-300 text-red-800 border-red-900'}>
                    Reject
                </Button>
            )}
            {hasApproveButton && (
                <Button htmlType="button" onClick={handleApprove}
                        className={'bg-yellow-300 text-yellow-800 border-yellow-900'}>
                    Approve
                </Button>
            )}
            {hasPublishButton && (
                <Button htmlType="button" onClick={handlePublish}
                        className={'bg-green-300 text-green-800 border-green-900'}>
                    Publish
                </Button>
            )}
            {hasUnpublishButton && (
                <Button htmlType="button" onClick={handleUnpublish}
                        className={'bg-purple-300 text-purple-800 border-purple-900'}>
                    Unpublish
                </Button>
            )}
        </div>
    );
};

export default SchoolFormButtonForAdmin;
