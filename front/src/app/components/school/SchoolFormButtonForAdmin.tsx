import React, {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, message, Modal, notification} from "antd";
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
import {formatErrorMessage, prepareSchoolAddData, prepareSchoolUpdateData} from "@/lib/util/schoolUtils";

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

    /**
     * Handles school creation
     */
    async function addSchoolHandle(addStatus: number) {
        const schoolValue = await prepareSchoolAddData(form, emailInputRef, phoneInputRef, messageApi);
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
                2,
                () => router.push("/admin/management/school/school-list")
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
    };

    /**
     * Handles school update
     */
    const handleUpdateSubmit = async () => {
        const schoolData = await prepareSchoolUpdateData(form, emailInputRef!, phoneInputRef!, messageApi);
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

    const handleConfirmAction = async () => {
        try {
            switch (activeButton) {
                case "publish":
                    await updateSchoolStatusByAdmin({ schoolId: Number(schoolId),  status: 4 }).unwrap();
                    messageApi.success('School published successfully!');
                    break;
                case "unpublish":
                    await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), status: 5 }).unwrap();
                    messageApi.success('School unpublished successfully!');
                    break;
                case "delete":
                    await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), status: 6 }).unwrap();
                    messageApi.success('School deleted successfully!');
                    break;
                case "approve":
                    await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), status: 2 }).unwrap();
                    messageApi.success('School approved successfully!');
                    break;
                case "reject":
                    await updateSchoolStatusByAdmin({ schoolId: Number(schoolId), status: 3 }).unwrap();
                    messageApi.success('School rejected successfully!');
                    break;
            }
            getSchoolByIdRefetch();
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

    const handleApprove = () => {
        setActiveButton("approve");
        setModalVisible(true);
    };

    const handleReject = () => {
        setActiveButton("reject");
        setModalVisible(true);
    };

    const handleEdit = () => {
        router.push(`/admin/management/school/edit-school/${schoolId}`);
    };

    const getModalContent = () => {
        switch (activeButton) {
            case "publish":
                return { title: "Publish School", desc: "Are you sure you want to publish this school?" };
            case "unpublish":
                return { title: "Unpublish School", desc: "Are you sure you want to unpublish this school?" };
            case "delete":
                return { title: "Delete School", desc: "Are you sure you want to delete this school?" };
            case "approve":
                return { title: "Approve School", desc: "Are you sure you want to approve this school?" };
            case "reject":
                return { title: "Reject School", desc: "Are you sure you want to reject this school?" };
            default:
                return { title: "", desc: "" };
        }
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
                <Button htmlType="button" onClick={handleDelete}
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
                <Button htmlType="button" onClick={handleReject}
                        className={'bg-red-300 text-red-800 border-red-900'}>
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
                        className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}>
                    Publish
                </Button>
            )}
            {hasUnpublishButton && (
                <Button htmlType="button" onClick={handleUnpublish}
                        className={'bg-emerald-600 hover:!bg-emerald-500 text-white hover:!text-white border-none'}>
                    Unpublish
                </Button>
            )}
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
    );
};

export default SchoolFormButtonForAdmin;
