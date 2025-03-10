import { Button, message, notification, UploadFile } from "antd";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { RootState } from '@/redux/store';
import {
    SchoolCreateDTO,
    SchoolDTO,
    SchoolUpdateDTO,
    useAddSchoolMutation,
    useUpdateSchoolByAdminMutation,
} from "@/redux/services/schoolApi";
import { ButtonGroupProps } from "@/app/components/school/SchoolFormButton";
import { useSelector } from "react-redux";

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
    emailInputRef,
    phoneInputRef
}) => {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.id;
    const user = useSelector((state: RootState) => state.user);

    const [updateSchoolByAdmin, { isLoading: isUpdating }] = useUpdateSchoolByAdminMutation();
    const [addSchool, { isLoading: isCreating }] = useAddSchoolMutation();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [api, notificationContextHolder] = notification.useNotification();




    //Config notifications
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

    // Function to handle error formatting
    const formatErrorMessage = (error: unknown): string | React.ReactNode => {
        let errorMessage: string | React.ReactNode = 'There was an error while adding the school. Please try again.';

        if (error && typeof error === 'object' && 'data' in error) {
            const errorData = (error as {
                data?: {
                    message?: string;
                    fieldErrors?: { message: string }[];
                    globalErrors?: { message: string }[];
                }
            }).data;

            const allErrorMessages: string[] = [];

            if (errorData?.fieldErrors && errorData.fieldErrors.length > 0) {
                allErrorMessages.push(...errorData.fieldErrors.map(err => err.message));
            }

            if (errorData?.globalErrors && errorData.globalErrors.length > 0) {
                allErrorMessages.push(...errorData.globalErrors.map(err => err.message));
            }

            if (allErrorMessages.length > 0) {
                errorMessage = allErrorMessages.map((msg, index) => (
                    <React.Fragment key={index}>
                        {'-' + msg}
                        {index < allErrorMessages.length - 1 && <br />}
                    </React.Fragment>
                ));
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            }
        } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = (error as { message?: string }).message || errorMessage;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        return errorMessage;
    };


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
            // Validate email and phone using refs from SchoolForm

            const isEmailValid = await emailInputRef?.current?.validateEmail();
            const isPhoneValid = await phoneInputRef?.current?.validatePhone();

            if (!isEmailValid || !isPhoneValid) {
                console.log('Validation failed');
                messageApi.error("Email or phone validation failed. Please check your inputs.");
                return null;
            }
            const fileList: File[] = (values.image as UploadFile[] || [])
                .filter((file) => file.originFileObj)
                .map((file) => file.originFileObj as File);
            const fullPhoneNumber = phoneInputRef?.current?.getFormattedPhoneNumber() || values.phone;

            // Prepare final data
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
        const schoolValue = await prepareSchoolData();
        if (!schoolValue) return;
        const finalValues: SchoolCreateDTO = {
            ...schoolValue,
            userId: Number(user.id),
            status: 1,
        };
        try {
            await addSchool(finalValues).unwrap();
            // console.log(finalValues);
            form.resetFields();
            openNotificationWithIcon(
                'success',
                'School Added Successfully',
                'The school has been added to the system successfully.',
                2
            );
            router.push("/admin/management/school/school-list");
        } catch (error: unknown) {
            const errorMessage = formatErrorMessage(error);
            openNotificationWithIcon(
                'error',
                'Failed to Add School',
                errorMessage,
                5
            );
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
            messageApi.success('School updated successfully!')
        } catch (error) {
            messageApi.error("Failed to update school. Please try again.");
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handlePublish = () => {
    };
    const handleUnpublish = () => {
    };
    const handleDelete = () => {
    };
    const handleApprove = () => {
    };
    const handleReject = () => {
    };
    const handleEdit = () => {
        router.push(`/admin/management/school/edit-school/${schoolId}`);
    };

    return (
        <div className="flex lg:justify-center space-x-4 justify-end">
            {messageContextHolder} {/* Render message context */}
            {notificationContextHolder} {/* Render notification context */}
            {hasCancelButton && (
                <Button htmlType="button" color="danger" onClick={handleCancel} >
                    Cancel
                </Button>
            )}
            {hasSaveButton && (
                <Button htmlType="button" onClick={() => {
                }} variant="outlined" color="primary"
                >
                    Save
                </Button>
            )}
            {hasCreateSubmitButton && (
                <Button htmlType="button" type="primary" onClick={handleCreateSubmit}
                    loading={isCreating}>
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
