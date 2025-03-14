import {Button, message, Modal, notification} from "antd";
import React, { useState } from "react";
import {useParams, useRouter} from "next/navigation";
import {ButtonGroupProps} from "@/app/components/school/SchoolFormButton";
import {
    SchoolCreateDTO,
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
    const user = useSelector((state: RootState) => state.user);

    const [updateSchoolStatusBySchoolOwner, {isLoading: isUpdatingStatus}] = useUpdateSchoolStatusBySchoolOwnerMutation();
    const [addSchool, {isLoading: isCreating}] = useAddSchoolMutation();

    const [messageApi, messageContextHolder] = message.useMessage();
    const [api, notificationContextHolder] = notification.useNotification();
    const [activeButton, setActiveButton] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

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

    const handleConfirmAction = async () => {
        try {
            switch (activeButton) {
                case "publish":
                    await updateSchoolStatusBySchoolOwner({ status: 4 }).unwrap();
                    messageApi.success('School published successfully!');
                    break;
                case "unpublish":
                    await updateSchoolStatusBySchoolOwner({ status: 5 }).unwrap();
                    messageApi.success('School unpublished successfully!');
                    break;
                case "delete":
                    await updateSchoolStatusBySchoolOwner({ status: 6 }).unwrap();
                    messageApi.success('School deleted successfully!');
                    break;
            }
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
        // Handle edit logic here
    };

    const getModalContent = () => {
        switch (activeButton) {
            case "publish":
                return { title: "Publish School", desc: "Are you sure you want to publish this school?" };
            case "unpublish":
                return { title: "Unpublish School", desc: "Are you sure you want to unpublish this school?" };
            case "delete":
                return { title: "Delete School", desc: "Are you sure you want to delete this school?" };
            default:
                return { title: "", desc: "" };
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
                {hasSaveButton &&
                    <Button htmlType="button" onClick={handleSave} variant="outlined" color="primary">
                        Save
                    </Button>
                }
                {hasCreateSubmitButton &&
                    <Button htmlType="button" type="primary" onClick={() => addSchoolHandle(1)} loading={isCreating}>
                        Submit
                    </Button>
                }
                {hasUpdateSubmitButton &&
                    <Button htmlType="button" onClick={handleUpdateSubmit}
                            className={'bg-blue-300 text-blue-800 border-blue-900'}>
                        Submit
                    </Button>
                }
                {hasDeleteButton &&
                    <Button
                        htmlType="button"
                        onClick={handleDelete} loading={isUpdatingStatus && activeButton === "delete"}
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
                        onClick={handlePublish} loading={isUpdatingStatus && activeButton === "publish"}
                        className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}
                    >
                        Publish
                    </Button>
                }
                {hasUnpublishButton &&
                    <Button
                        htmlType="button"
                        onClick={handleUnpublish} loading={isUpdatingStatus && activeButton === "unpublish"}
                        className={'bg-purple-300 text-purple-800 border-purple-900'}
                    >
                        Unpublish
                    </Button>
                }
                <Modal
                    title={getModalContent().title}
                    open={modalVisible}
                    onOk={handleConfirmAction}
                    onCancel={() => {
                        setModalVisible(false);
                        setActiveButton(null);
                    }}
                    okText="Yes"
                    cancelText="No, Take me back!"
                    confirmLoading={isUpdatingStatus}
                >
                    <p>{getModalContent().desc}</p>
                </Modal>
            </div>
        </>
    );
}

export default SchoolFormButtonForSchoolOwner;