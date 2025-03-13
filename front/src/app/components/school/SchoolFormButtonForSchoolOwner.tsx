import {Button, message, notification, UploadFile} from "antd";
import React, {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {ButtonGroupProps} from "@/app/components/school/SchoolFormButton";
import {
    SchoolCreateDTO,
    SchoolDTO,
    SchoolUpdateDTO,
    useAddSchoolMutation,
    useUpdateSchoolStatusBySchoolOwnerMutation
} from "@/redux/services/schoolApi";
import {useSelector} from "react-redux";
import {RootState} from '@/redux/store';
import {formatErrorMessage, prepareSchoolData} from "@/lib/schoolUtils";

const SchoolFormButtonForSchoolOwner: React.FC<ButtonGroupProps> = (
    {
        form,
        hasCancelButton,
        hasSaveButton,
        hasCreateSaveButton,
        hasCreateSubmitButton,
        hasUpdateSubmitButton,
        hasDeleteButton,
        hasEditButton,
        hasPublishButton,
        hasUnpublishButton,
        emailInputRef,
        phoneInputRef
    }
) => {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.id;
    const user = useSelector((state: RootState) => state.user);

    const [updateSchoolStatusBySchoolOwner, {isLoading: isUpdatingStatus}] = useUpdateSchoolStatusBySchoolOwnerMutation();
    const [addSchool, {isLoading: isCreating}] = useAddSchoolMutation();

    const [messageApi, messageContextHolder] = message.useMessage();
    const [api, notificationContextHolder] = notification.useNotification();

    // Config notifications
    const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string | React.ReactNode, duration: number) => {
        api[type]({
            message,
            description,
            duration: duration,
            placement: 'topRight',
            showProgress: true,
            pauseOnHover: false
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
            await addSchool(finalValues).unwrap();
            console.log(finalValues);
            form.resetFields();
            openNotificationWithIcon(
                'success',
                'School Added Successfully',
                'The school has been added to the system successfully.',
                2
            );
            router.push("/school/school-detail");
        } catch (error: unknown) {
            const errorMessage = formatErrorMessage(error); // Sử dụng hàm utility
            openNotificationWithIcon(
                'error',
                'Failed to Add School',
                errorMessage,
                5
            );
        }
    };

    const handleSave = () => {
        // Handle save logic here
    };

    const handleCreateSubmit = async () => {
        // Handle create submit logic here
    };

    const handleUpdateSubmit = async () => {
        // Handle update submit logic here
    };

    const handleCancel = () => {
        // Handle cancel logic here
    };

    const handlePublish = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({
                schoolId: Number(schoolId),
                changeSchoolStatusDTO: {status: 4}
            }).unwrap();
            messageApi.success('School published successfully!');
        } catch (error) {
            messageApi.error("Failed to publish school. Please try again.");
        }
    };

    const handleUnpublish = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({
                schoolId: Number(schoolId),
                changeSchoolStatusDTO: {status: 5}
            }).unwrap();
            messageApi.success('School unpublished successfully!');
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
    };

    const handleDelete = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({
                schoolId: Number(schoolId),
                changeSchoolStatusDTO: {status: 5}
            }).unwrap();
            messageApi.success('School unpublished successfully!');
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
    };

    const handleEdit = () => {
        // Handle edit logic here
    };

    return (
        <>
            {messageContextHolder} {/* Render message context */}
            {notificationContextHolder} {/* Render notification context */}
            <div className="flex lg:justify-center space-x-4 justify-end">
                {hasCancelButton && (
                    <Button htmlType="button" color="danger" onClick={handleCancel}>
                        Cancel
                    </Button>
                )}
                {hasCreateSaveButton && (
                    <Button htmlType="button" onClick={() => addSchoolHandle(0)} variant="outlined" color="primary"
                            loading={isCreating}>
                        Save
                    </Button>
                )}
                {hasSaveButton && (
                    <Button htmlType="button" onClick={handleSave} variant="outlined" color="primary">
                        Save
                    </Button>
                )}
                {hasCreateSubmitButton && (
                    <Button htmlType="button" type="primary" onClick={() => addSchoolHandle(1)} loading={isCreating}>
                        Submit
                    </Button>
                )}
                {hasUpdateSubmitButton && (
                    <Button htmlType="button" onClick={handleUpdateSubmit}
                            className={'bg-blue-300 text-blue-800 border-blue-900'}>
                        Submit
                    </Button>
                )}
                {hasDeleteButton && (
                    <Button htmlType="button" onClick={handleDelete}
                            className={'bg-red-600 hover:!bg-red-500 text-white hover:!text-white border-none'}>
                        Delete
                    </Button>
                )}
                {hasEditButton && (
                    <Button htmlType="button" type={'primary'} onClick={handleEdit}>
                        Edit
                    </Button>
                )}
                {hasPublishButton && (
                    <Button htmlType="button" onClick={handlePublish}
                            className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}>
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
        </>
    );
}

export default SchoolFormButtonForSchoolOwner;