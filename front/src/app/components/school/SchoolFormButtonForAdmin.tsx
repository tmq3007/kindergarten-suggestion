import React, {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, message, notification} from "antd";
import {RootState} from '@/redux/store';
import {
    SchoolCreateDTO,
    useAddSchoolMutation,
    useGetSchoolByIdQuery,
    useUpdateSchoolByAdminMutation,
    useUpdateSchoolStatusByAdminMutation,
} from "@/redux/services/schoolApi";
import {useSelector} from "react-redux";
import {ButtonGroupProps} from "./SchoolFormButton";
import {formatErrorMessage, prepareSchoolData} from "@/lib/schoolUtils";

const SchoolFormButtonForAdmin: React.FC<ButtonGroupProps> = ({
                                                                  form,
                                                                  hasCancelButton,
                                                                  hasCreateSubmitButton,
                                                                  hasUpdateSubmitButton,
                                                                  hasDeleteButton,
                                                                  hasEditButton,
                                                                  hasRejectButton,
                                                                  hasApproveButton,
                                                                  hasPublishButton,
                                                                  hasUnpublishButton,
                                                                  emailInputRef,
                                                                  phoneInputRef
                                                              }) => {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.id;
    const user = useSelector((state: RootState) => state.user);

    const [updateSchoolByAdmin, {isLoading: isUpdating}] = useUpdateSchoolByAdminMutation();
    const [addSchool, {isLoading: isCreating}] = useAddSchoolMutation();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [api, notificationContextHolder] = notification.useNotification();
    const { refetch : getSchoolByIdRefetch } = useGetSchoolByIdQuery(Number(schoolId));
    const [updateSchoolStatusByAdmin, { isLoading: isUpdatingStatus }] = useUpdateSchoolStatusByAdminMutation();
    const [activeButton, setActiveButton] = useState<string | null>(null);

    // Config notifications
    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string | React.ReactNode, duration: number, onClose: () => void) => {
        api[type]({
            message,
            description,
            duration: duration,
            placement: 'topRight',
            showProgress: true,
            pauseOnHover: false,
            onClose: onClose
        });
    };

    /**
     * Handles school creation
     */
    async function addSchoolHandle(addStatus: number) {
        const schoolValue = await prepareSchoolData(form, emailInputRef!, phoneInputRef!, messageApi); // Sử dụng hàm utility
        if (!schoolValue) return;
        const finalValues: SchoolCreateDTO = {
            ...schoolValue,
            userId: Number(user.id),
            status: addStatus,
        };
        try {
            // await addSchool(finalValues).unwrap();
            console.log(finalValues);
            // form.resetFields();
            // openNotificationWithIcon(
            //     'success',
            //     'School Added Successfully',
            //     'The school has been added to the system successfully.',
            //     2,
            //     () => router.push("/admin/management/school/school-list")
            // );
        } catch (error: unknown) {
            const errorMessage = formatErrorMessage(error);
            openNotificationWithIcon(
                'error',
                'Failed to Add School',
                errorMessage,
                5,
                () => {
                },
            );
        }
    };

    /**
     * Handles school update
     */
    const handleUpdateSubmit = async () => {
        const schoolData = await prepareSchoolData(form, emailInputRef!, phoneInputRef!, messageApi);
        if (!schoolData) return;
        try {
            await updateSchoolByAdmin({id: Number(schoolId), ...schoolData}).unwrap();
            messageApi.success('School updated successfully!');
            getSchoolByIdRefetch();
        } catch (error) {
            console.log(error)
            messageApi.error("Failed to update school. Please try again.");
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handlePublish = async () => {
        setActiveButton("publish");
        try {
            await updateSchoolStatusByAdmin({schoolId: Number(schoolId), changeSchoolStatusDTO: {status: 4}}).unwrap();
            messageApi.success('School published successfully!');
            getSchoolByIdRefetch();
        } catch (error) {
            messageApi.error("Failed to publish school. Please try again.");
        }
    };

    const handleUnpublish = async () => {
        setActiveButton("unpublish");
        try {
            await updateSchoolStatusByAdmin({schoolId: Number(schoolId), changeSchoolStatusDTO: {status: 5}}).unwrap();
            messageApi.success('School unpublished successfully!');
            getSchoolByIdRefetch();
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
    };

    const handleDelete = async () => {
        setActiveButton("delete");
        try {
            await updateSchoolStatusByAdmin({schoolId: Number(schoolId), changeSchoolStatusDTO: {status: 6}}).unwrap();
            messageApi.success('School deleted successfully!');
        } catch (error) {
            messageApi.error("Failed to delete school. Please try again.");
        }
    };

    const handleApprove = async () => {
        setActiveButton("approve");
        try {
            await updateSchoolStatusByAdmin({schoolId: Number(schoolId), changeSchoolStatusDTO: {status: 2}}).unwrap();
            messageApi.success('School approved successfully!');
            getSchoolByIdRefetch();
        } catch (error) {
            messageApi.error("Failed to approve school. Please try again.");
        }
    };

    const handleReject = async () => {
        setActiveButton("reject");
        try {
            await updateSchoolStatusByAdmin({schoolId: Number(schoolId), changeSchoolStatusDTO: {status: 3}}).unwrap();
            messageApi.success('School rejected successfully!');
            getSchoolByIdRefetch();
        } catch (error) {
            messageApi.error("Failed to reject school. Please try again.");
        }
    };

    const handleEdit = () => {
        router.push(`/admin/management/school/edit-school/${schoolId}`);
    };

    return (
        <div className="flex lg:justify-center space-x-4 justify-end">
            {messageContextHolder} {/* Render message context */}
            {notificationContextHolder} {/* Render notification context */}
            {hasCancelButton && (
                <Button htmlType="button" color="danger" onClick={handleCancel}>
                    Cancel
                </Button>
            )}
            {hasCreateSubmitButton && (
                <Button htmlType="button" type="primary" onClick={() => addSchoolHandle(1)} loading={isCreating}>
                    Submit
                </Button>
            )}
            {hasUpdateSubmitButton && (
                <Button htmlType="button" type="primary" onClick={handleUpdateSubmit} loading={isUpdating}>
                    Submit
                </Button>
            )}
            {hasDeleteButton && (
                <Button htmlType="button" onClick={handleDelete} loading={isUpdatingStatus && activeButton === "delete"}
                        className={'bg-red-600 hover:!bg-red-500 text-white hover:!text-white border-none'}>
                    Delete
                </Button>
            )}
            {hasEditButton && (
                <Button type={'primary'} htmlType="button" onClick={handleEdit}>
                    Edit
                </Button>
            )}
            {hasRejectButton && (
                <Button htmlType="button" onClick={handleReject} loading={isUpdatingStatus && activeButton === "reject"}
                        className={'bg-red-300 text-red-800 border-red-900'}>
                    Reject
                </Button>
            )}
            {hasApproveButton && (
                <Button htmlType="button" onClick={handleApprove} loading={isUpdatingStatus && activeButton === "approve"}
                        className={'bg-yellow-300 text-yellow-800 border-yellow-900'}>
                    Approve
                </Button>
            )}
            {hasPublishButton && (
                <Button htmlType="button" onClick={handlePublish} loading={isUpdatingStatus && activeButton === "publish"}
                        className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}>
                    Publish
                </Button>
            )}
            {hasUnpublishButton && (
                <Button htmlType="button" onClick={handleUnpublish} loading={isUpdatingStatus && activeButton === "unpublish"}
                        className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}>
                    Unpublish
                </Button>
            )}
        </div>
    );
};

export default SchoolFormButtonForAdmin;
