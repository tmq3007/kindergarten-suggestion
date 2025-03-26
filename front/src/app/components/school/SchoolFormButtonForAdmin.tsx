import React, {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, message, Modal, notification} from "antd";
import {RootState} from '@/redux/store';
import {
    SchoolCreateDTO,
    useAddSchoolMutation,
    useGetSchoolByIdQuery, useIsDraftQuery, useMergeDraftMutation,
    useUpdateSchoolByAdminMutation,
    useUpdateSchoolStatusByAdminMutation,
} from "@/redux/services/schoolApi";
import {useSelector} from "react-redux";
import {ButtonGroupProps} from "./SchoolFormButton";
import {formatErrorMessage, prepareSchoolAddData, prepareSchoolUpdateData} from "@/lib/util/schoolUtils";
import MyEditor from "@/app/components/common/MyEditor";

const SchoolFormButtonForAdmin: React.FC<ButtonGroupProps> = ({
                                                                  form,
                                                                  hasCancelButton,
                                                                  hasCreateSubmitButton,
                                                                  hasUpdateSubmitButton,
                                                                  hasDeleteButton,
                                                                  hasEditButton,
                                                                  hasRejectButton,
                                                                  hasApproveButton,
                                                                  hasApproveDraftButton,
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
    const {refetch: getSchoolByIdRefetch} = useGetSchoolByIdQuery(Number(schoolId));
    const [updateSchoolStatusByAdmin, {isLoading: isUpdatingStatus}] = useUpdateSchoolStatusByAdminMutation();
    const {data: isDraftData, isLoading: isDraftLoading} = useIsDraftQuery(Number(schoolId));
    const isDraft = isDraftData?.data;
    const [mergeDraft, {isLoading: isMerging}] = useMergeDraftMutation();


    const [activeButton, setActiveButton] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [messageApi, messageContextHolder] = message.useMessage();
    const [api, notificationContextHolder] = notification.useNotification();
    const [responseContent, setResponseContent] = useState<string>("");

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
    }

    /**
     * Handles school update
     */
    const updateSubmit = async () => {
        const schoolData = await prepareSchoolUpdateData(form, emailInputRef!, phoneInputRef!, messageApi);
        if (!schoolData) return;
        try {
            await updateSchoolByAdmin({id: Number(schoolId), ...schoolData}).unwrap();
            openNotificationWithIcon(
                'success',
                'School updated successfully!',
                'The school has been updated successfully!',
                2,
                () => getSchoolByIdRefetch()
            );
        } catch (error) {
            console.log(error)
            openNotificationWithIcon(
                'error',
                'Failed to update school',
                'There was an error while updating the school. Please try again.',
                2,
                () => {
                }
            );
        }
    };

    const handleUpdateSubmit = () => {
        setActiveButton("update");
        setModalVisible(true);
    };

    const approveDraft = async () => {
        try {
            const mergeData = await mergeDraft(Number(schoolId)).unwrap();
            const isSuccess = mergeData?.data;
            if (isSuccess) {
                openNotificationWithIcon(
                    'success',
                    'Draft merged successfully!',
                    'The draft has been merged successfully!',
                    2,
                    () => getSchoolByIdRefetch()
                );
            }

        } catch (error) {
            openNotificationWithIcon(
                'error',
                'Failed to merge draft',
                'There was an error while merging the school. Please try again.',
                2,
                () => {
                }
            );
        }
    };

    const handleApproveDraft = () => {
        setActiveButton("approve-draft");
        setModalVisible(true);
    };

    const handleCancel = () => {
        router.back();
    };

    const handleResponseChange = (response: string) => {
        setResponseContent(response);
    };

    const handleConfirmAction = async () => {
        try {
            switch (activeButton) {
                case "update":
                    setModalVisible(false);
                    await updateSubmit();
                    break;
                case "approve-draft":
                    setModalVisible(false);
                    await approveDraft();
                    break;
                case "publish":
                    await updateSchoolStatusByAdmin({schoolId: Number(schoolId), status: 4, response: ''}).unwrap();
                    messageApi.success('School published successfully!');
                    break;
                case "unpublish":
                    await updateSchoolStatusByAdmin({schoolId: Number(schoolId), status: 5, response: ''}).unwrap();
                    messageApi.success('School unpublished successfully!');
                    break;
                case "delete":
                    await updateSchoolStatusByAdmin({schoolId: Number(schoolId), status: 6, response: responseContent}).unwrap();
                    messageApi.success('School deleted successfully!');
                    break;
                case "approve":
                    await updateSchoolStatusByAdmin({schoolId: Number(schoolId), status: 2, response: ''}).unwrap();
                    messageApi.success('School approved successfully!');
                    break;
                case "reject":
                    await updateSchoolStatusByAdmin({schoolId: Number(schoolId), status: 3, response: responseContent}).unwrap();
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
            case "update":
                return { title: "Update School", desc: "Are you sure you want to update this school?", showEditor: false };
            case "approve-draft":
                return { title: "Approve School", desc: "Are you sure you want to approve this school?", showEditor: false };
            case "publish":
                return { title: "Publish School", desc: "Are you sure you want to publish this school?", showEditor: false };
            case "unpublish":
                return { title: "Unpublish School", desc: "Are you sure you want to unpublish this school?", showEditor: false };
            case "delete":
                return { title: "Delete School", desc: "Are you sure you want to delete this school? If yes, briefly describe the reason:cd f", showEditor: true };
            case "approve":
                return { title: "Approve School", desc: "Are you sure you want to approve this school?", showEditor: false };
            case "reject":
                return { title: "Reject School", desc: "Are you sure you want to reject this school? If yes, briefly describe the reason:", showEditor: true };
            default:
                return { title: "", desc: "", showEditor: false };
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
                        className={'bg-fuchsia-600 hover:!bg-fuchsia-500 text-white hover:!text-white border-none'}>
                    Reject
                </Button>
            )}
            {!isDraftLoading && !isDraft && hasApproveButton && (
                <Button htmlType="button" onClick={handleApprove}
                        className={'bg-yellow-400 hover:!bg-yellow-300 text-white hover:!text-white border-none'}>
                    Approve
                </Button>
            )}
            {!isDraftLoading && isDraft && hasApproveDraftButton && (
                <Button htmlType="button" onClick={handleApproveDraft}
                        className={'bg-yellow-400 hover:!bg-yellow-300 text-white hover:!text-white border-none'}
                        loading={isMerging}
                >
                    Approve2
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


            {/* Modal confirm */}
            <Modal
                title={<p className={'font-bold text-3xl text-start'}>{getModalContent().title}</p>}
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
                <p className={'text-lg text-start'}>{getModalContent().desc}</p>
                {getModalContent().showEditor && (
                    <MyEditor
                        description={responseContent}
                        onChange={handleResponseChange}
                    />
                )}
            </Modal>
        </div>
    );
};

export default SchoolFormButtonForAdmin;
