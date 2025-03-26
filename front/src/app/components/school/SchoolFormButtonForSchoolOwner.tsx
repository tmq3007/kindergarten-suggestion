import {Button, message, Modal, notification, UploadFile} from "antd";
import React, {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {ButtonGroupProps} from "@/app/components/school/SchoolFormButton";
import {
    SchoolCreateDTO,
    useAddSchoolMutation, useSaveSchoolBySchoolOwnerMutation, useUpdateSchoolBySchoolOwnerMutation,
    useUpdateSchoolStatusBySchoolOwnerMutation
} from "@/redux/services/schoolApi";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from '@/redux/store';
import {formatErrorMessage, prepareSchoolAddData, prepareSchoolUpdateData} from "@/lib/util/schoolUtils";
import {updateHasDraft} from "@/redux/features/userSlice";
import {useGetDraftOfSchoolOwnerQuery, useGetSchoolOfSchoolOwnerQuery} from "@/redux/services/schoolOwnerApi";

const SchoolFormButtonForSchoolOwner: React.FC<ButtonGroupProps> = (
    {
        form,
        hasCancelButton,
        hasUpdateSaveButton,
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
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const hasDraft = user.hasDraft;
    const draftQuery = useGetDraftOfSchoolOwnerQuery(undefined, {skip: !hasDraft});
    const schoolQuery = useGetSchoolOfSchoolOwnerQuery(undefined, {skip: hasDraft});
    const schoolQueryResult = hasDraft ? draftQuery : schoolQuery;
    const {data, isLoading, refetch} = schoolQueryResult;
    const schoolStatus = data?.data?.status;
    const [updateSchoolStatusBySchoolOwner, {isLoading: isUpdatingStatus}] = useUpdateSchoolStatusBySchoolOwnerMutation();
    const [addSchool, {isLoading: isCreating}] = useAddSchoolMutation();
    const [updateSchoolBySO, {isLoading: isUpdatingBySO}] = useUpdateSchoolBySchoolOwnerMutation();
    const [saveSchoolBySO, {isLoading: isSavingBySO}] = useSaveSchoolBySchoolOwnerMutation();


    const [messageApi, messageContextHolder] = message.useMessage();
    const [api, notificationContextHolder] = notification.useNotification();
    const [activeButton, setActiveButton] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

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

    /*
     * Utility function to prepare school data before submission
     * - Validates form fields
     * - Formats phone number correctly
     * - Extracts uploaded images
     */

    /**
     * Handles school creation
     */
    async function addSchoolHandle(addStatus: number) {
        const schoolValue = await prepareSchoolAddData(form, emailInputRef, phoneInputRef, messageApi); // Sử dụng hàm utility
        if (!schoolValue) return;
        const finalValues: SchoolCreateDTO = {
            ...schoolValue,
            userId: Number(user.id),
            status: addStatus,
        };
        try {
            await addSchool(finalValues).unwrap();
            console.log(finalValues);
            refetch();
            form.resetFields();
            openNotificationWithIcon(
                'success',
                'School Added Successfully',
                'The school has been added to the system successfully! Please wait for the admins to review.',
                2,
                () => {router.push("/public/school-owner")}
            );
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
    }

    const updateSave = async () => {
        const schoolData = await prepareSchoolUpdateData(form, emailInputRef!, phoneInputRef!, messageApi);
        if (!schoolData) return;
        try {
            await saveSchoolBySO({id: undefined, ...schoolData}).unwrap();
            if (!hasDraft) {
                dispatch(updateHasDraft(true));
            }
            openNotificationWithIcon(
                'success',
                'School saved successfully!',
                'The school has been saved successfully!',
                2,
                () => refetch()
            );
        } catch (error) {
            console.log("error==================")
            console.log(error)
            openNotificationWithIcon(
                'error',
                'Failed to save school',
                'There was an error while saving the school. Please try again.',
                2,
                () => {
                }
            );
        }
    };

    const handleSave = async () => {
        setActiveButton("save");
        setModalVisible(true);
    };

    const handleCreateSubmit = async () => {
        // Handle create submit logic here
    };

    const updateSubmit = async () => {
        const schoolData = await prepareSchoolUpdateData(form, emailInputRef!, phoneInputRef!, messageApi);
        if (!schoolData) return;
        try {
            await updateSchoolBySO({id: undefined, ...schoolData}).unwrap();
            if (!hasDraft) {
                dispatch(updateHasDraft(true));
            }
            openNotificationWithIcon(
                'success',
                'School submitted successfully!',
                'The school has been submitted successfully!',
                2,
                () => refetch()
            );
        } catch (error) {
            console.log(error)
            openNotificationWithIcon(
                'error',
                'Failed to submit school',
                'There was an error while submitting the school. Please try again.',
                2,
                () => {
                }
            );
        }
    };

    const handleUpdateSubmit = async () => {
        setActiveButton("update");
        setModalVisible(true);
    };

    const handleCancel = () => {
        // Handle cancel logic here
        router.push('/public/school-owner');
    };

    const handleConfirmAction = async () => {
        try {
            switch (activeButton) {
                case "update":
                    setModalVisible(false);
                    await updateSubmit()
                    break;
                case "save":
                    setModalVisible(false);
                    await updateSave()
                    break;
                case "publish":
                    await updateSchoolStatusBySchoolOwner({schoolId: Number(null), status: 4}).unwrap();
                    openNotificationWithIcon(
                        "success",
                        "School published successfully!",
                        "The school has been published successfully!",
                        2,
                        () => {}
                    );
                    break;
                case "unpublish":
                    await updateSchoolStatusBySchoolOwner({schoolId: Number(null), status: 5}).unwrap();
                    openNotificationWithIcon(
                        "success",
                        "School unpublished successfully!",
                        "The school has been unpublished successfully!",
                        2,
                        () => {}
                    );
                    break;
                case "delete":
                    await updateSchoolStatusBySchoolOwner({schoolId: Number(null), status: 6}).unwrap();
                    openNotificationWithIcon(
                        "success",
                        "School deleted successfully!",
                        "The school has been deleted successfully!",
                        2,
                        () => {}
                    );
                    break;
            }
            refetch();
            setModalVisible(false);
            setActiveButton(null);
        } catch (error) {
            messageApi.error(`Failed to ${activeButton} school. Please try again.`);
            setModalVisible(false);
        }
    };

    const handlePublish = () => {
        setActiveButton("publish");
        setModalVisible(true);
    };

    const handleUnpublish = () => {
        setActiveButton("unpublish");
        setModalVisible(true);
    };

    const handleDelete = () => {
        setActiveButton("delete");
        setModalVisible(true);
    };

    const handleEdit = () => {
        router.push('/public/school-owner/edit-school');
    };

    const getModalContent = () => {
        switch (activeButton) {
            case "update":
                return {title: "Update School", desc: "Are you sure you want to update this school?"};
            case "save":
                return {title: "Save School", desc: "Are you sure you want to save this school?"};
            case "publish":
                return {title: "Publish School", desc: "Are you sure you want to publish this school?"};
            case "unpublish":
                return {title: "Unpublish School", desc: "Are you sure you want to unpublish this school?"};
            case "delete":
                return {title: "Delete School", desc: "Are you sure you want to delete this school?"};
            default:
                return {title: "", desc: ""};
        }
    };

    return (
        <>
            {messageContextHolder} {/* Render message context */}
            {notificationContextHolder} {/* Render notification context */}
            <div className="flex lg:justify-center space-x-4 justify-end">
                {hasCancelButton &&
                    <Button htmlType="button" color="danger" onClick={handleCancel}>
                        Cancel
                    </Button>
                }
                {hasCreateSaveButton &&
                    <Button htmlType="button" onClick={() => addSchoolHandle(0)} variant="outlined" color="primary"
                            loading={isCreating}>
                        Save
                    </Button>
                }
                {hasUpdateSaveButton && String(schoolStatus) !== "1" && (
                    <Button htmlType="button"
                            onClick={handleSave}
                            variant="outlined"
                            color="primary"
                            loading={isSavingBySO}
                    >
                        Save
                    </Button>
                )}
                {hasCreateSubmitButton &&
                    <Button htmlType="button"
                            type="primary"
                            onClick={() => addSchoolHandle(1)} loading={isCreating}>
                        Submit
                    </Button>
                }
                {hasUpdateSubmitButton && String(schoolStatus) !== "1" && (
                    <Button
                        htmlType="button"
                        onClick={handleUpdateSubmit}
                        loading={isUpdatingBySO}
                        type="primary"
                    >
                        Submit
                    </Button>
                )}
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
                    <Button htmlType="button" type={'primary'} onClick={handleEdit}>
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
                        className={'bg-purple-600 hover:!bg-purple-500 text-white hover:!text-white border-none\''}
                    >
                        Unpublish
                    </Button>
                }

                <Modal
                    title={<p className={'text-center font-bold text-3xl'}>{getModalContent().title}</p>}
                    open={modalVisible}
                    onOk={handleConfirmAction}
                    onCancel={() => {
                        setModalVisible(false);
                        setActiveButton(null);
                    }}
                    okText="Yes"
                    cancelText="No, Take me back!"
                    confirmLoading={isUpdatingStatus}
                    getContainer={false}
                >
                    <p className={'text-center text-lg'}>{getModalContent().desc}</p>
                </Modal>

            </div>
        </>
    );
}

export default SchoolFormButtonForSchoolOwner;