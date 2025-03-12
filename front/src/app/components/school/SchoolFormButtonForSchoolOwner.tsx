import { Button, message, notification, UploadFile } from "antd";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ButtonGroupProps } from "@/app/components/school/SchoolFormButton";
import { SchoolCreateDTO, SchoolDTO, SchoolUpdateDTO, useAddSchoolMutation, useUpdateSchoolStatusBySchoolOwnerMutation } from "@/redux/services/schoolApi";
import { useSelector } from "react-redux";
import { RootState } from '@/redux/store';



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

    const [updateSchoolStatusBySchoolOwner, { isLoading: isUpdatingStatus }] = useUpdateSchoolStatusBySchoolOwnerMutation();
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
    async function addSchoolHandle(addStatus: number) {
        const schoolValue = await prepareSchoolData();
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
            const errorMessage = formatErrorMessage(error);
            openNotificationWithIcon(
                'error',
                'Failed to Add School',
                errorMessage,
                5
            );
        }
    };
    const handleSave = () => {

    };

    const handleCreateSubmit = async () => {

    };

    const handleUpdateSubmit = async () => {

    };

    const handleCancel = () => {

    };

    const handlePublish = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 4 } }).unwrap();
            messageApi.success('School published successfully!')
        } catch (error) {
            messageApi.error("Failed to publish school. Please try again.");
        }
    };
    const handleUnpublish = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 5 } }).unwrap();
            messageApi.success('School unpublished successfully!')
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
    };

    const handleDelete = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 5 } }).unwrap();
            messageApi.success('School unpublished successfully!')
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
    };

    const handleEdit = () => {
    };
    return (
        <>
            {messageContextHolder} {/* Render message context */}
            {notificationContextHolder} {/* Render notification context */}
            <div className="flex lg:justify-center space-x-4 justify-end">
                {hasCancelButton && (
                    <Button htmlType="button" color="danger" onClick={handleCancel} >
                        Cancel
                    </Button>
                )}
                {hasCreateSaveButton && (
                    <Button htmlType="button" onClick={() => {
                        addSchoolHandle(0);
                    }} variant="outlined" color="primary" loading={isCreating}
                    >
                        Save
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
                    <Button htmlType="button" type="primary" onClick={() => {
                        addSchoolHandle(1);
                    }}
                        loading={isCreating}>
                        Submit
                    </Button>
                )}
                {hasUpdateSubmitButton &&
                    <Button
                        htmlType="button"
                        onClick={handleUpdateSubmit}
                        className={'bg-blue-300 text-blue-800 border-blue-900'}
                    >
                        Submit
                    </Button>
                }
                {hasDeleteButton &&
                    <Button
                        htmlType="button"
                        onClick={handleDelete}
                        className={'bg-red-600 hover:!bg-red-500 text-white hover:!text-white border-none'}
                    >
                        Delete
                    </Button>
                }
                {hasEditButton &&
                    <Button
                        htmlType="button"
                        type={'primary'}
                        onClick={handleEdit}
                    >
                        Edit
                    </Button>
                }
                {hasPublishButton &&
                    <Button
                        htmlType="button"
                        onClick={handlePublish}
                        className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}
                    >
                        Publish
                    </Button>
                }
                {hasUnpublishButton &&
                    <Button
                        htmlType="button"
                        onClick={handleUnpublish}
                        className={'bg-purple-300 text-purple-800 border-purple-900'}
                    >
                        Unpublish
                    </Button>
                }
            </div>
        </>
    );
}

export default SchoolFormButtonForSchoolOwner;