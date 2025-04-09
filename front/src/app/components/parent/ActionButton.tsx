import {Button, Checkbox} from "antd";
import {useState, useEffect, memo} from "react";
import {
    useEnrollParentMutation,
    useRejectParentMutation,
    useUnEnrollParentMutation
} from "@/redux/services/parentApi";
import {useDispatch} from "react-redux";
import {decrementPendingRequestsCount} from "@/redux/features/parentSlice";
import Lottie from "lottie-react";
import approveCheckAnimation from "@public/lottie/CheckedAnimation.json";
import {MessageInstance} from "antd/lib/message/interface";
import useModal from "antd/es/modal/useModal";

interface ActionButtonsProps {
    id?: number;
    onDeleteSuccess?: (id: number) => void;
    isEnrollPage?: boolean;
    isAdminPage?: boolean;
    message: MessageInstance;
    skipConfirmations: {
        approve: boolean;
        reject: boolean;
        unEnroll: boolean;
    };
    updateSkipConfirmation: (action: "approve" | "reject" | "unEnroll", value: boolean) => void;
}

const ActionButtons = ({
                           id,
                           onDeleteSuccess,
                           isAdminPage = false,
                           isEnrollPage = false,
                           message,
                           skipConfirmations,
                           updateSkipConfirmation,
                       }: ActionButtonsProps) => {
    
    const dispatch = useDispatch();
    const [modal, contextHolder] = useModal();
    const [unenrollTrigger] = useUnEnrollParentMutation();
    const [approveTrigger] = useEnrollParentMutation();
    const [rejectTrigger] = useRejectParentMutation();

    const [buttonsLoadingStates, setButtonsLoadingStates] = useState<{
        unEnroll: "idle" | "loading" | "done";
        approve: "idle" | "loading" | "done";
        reject: "idle" | "loading" | "done";
    }>({
        unEnroll: "idle",
        approve: "idle",
        reject: "idle",
    });

    useEffect(() => {
        setButtonsLoadingStates({
            unEnroll: "idle",
            approve: "idle",
            reject: "idle",
        });
    }, [id, isEnrollPage]);

    const isCompleted =
        buttonsLoadingStates.approve === "done" ||
        buttonsLoadingStates.reject === "done" ||
        buttonsLoadingStates.unEnroll === "done";
    const isLoading =
        buttonsLoadingStates.approve === "loading" ||
        buttonsLoadingStates.reject === "loading" ||
        buttonsLoadingStates.unEnroll === "loading";

    const approveRequest = async (id: number) => {
        return approveTrigger(id);
    };

    const rejectRequest = async (id: number) => {
        return rejectTrigger(id);
    };

    const unEnrollRequest = async (id: number) => {
        return unenrollTrigger(id);
    };

    const handleAction = async (action: "approve" | "reject" | "unEnroll") => {
        if (!id) {
            message.error({
                content: "No ID provided",
                duration: 3,
                key: "no-id-error"
            });
            return;
        }

        setButtonsLoadingStates((prev) => ({...prev, [action]: "loading"}));

        try {
            if (action === "approve") {
                await approveRequest(id);
                message.success({
                    content: "Request approved successfully!",
                    duration: 3,
                    key: "approve-success"
                });
                dispatch(decrementPendingRequestsCount());
            } else if (action === "reject") {
                await rejectRequest(id);
                message.success({
                    content: "Request rejected successfully!",
                    duration: 3,
                    key: "reject-success"
                });
                dispatch(decrementPendingRequestsCount());
            } else if (action === "unEnroll") {
                await unEnrollRequest(id);
                message.success({
                    content: "Parent unenrolled successfully!",
                    duration: 3,
                    key: "unenroll-success"
                });
            }

            if (onDeleteSuccess) onDeleteSuccess(id);
            setButtonsLoadingStates((prev) => ({...prev, [action]: "done"}));
        } catch (err: any) {
            const errorMessage = err?.data?.message || `Failed to ${action} request`;
            message.error({
                content: errorMessage,
                duration: 4,
                key: `${action}-error`,
                style: {
                    marginTop: '20vh',
                },
            });
            setButtonsLoadingStates((prev) => ({...prev, [action]: "idle"}));
        }
    };

    const showConfirm = (action: "approve" | "reject" | "unEnroll") => {
        const titles = {
            approve: "Approve Request",
            reject: "Reject Request",
            unEnroll: "Unenroll Parent"
        };

        const contents = {
            approve: "Are you sure you want to approve this request?",
            reject: "Are you sure you want to reject this request?",
            unEnroll: "Are you sure you want to unenroll this parent?"
        };

        modal.confirm({
            title: titles[action],
            content: (
                <div>
                    <p>{contents[action]}</p>
                    <Checkbox
                        onChange={(e) => {
                            updateSkipConfirmation(action, e.target.checked);
                        }}
                    >
                        Do not ask again
                    </Checkbox>
                </div>
            ),
            okText: "Yes",
            okType: action === "approve" ? "primary" : "danger",
            cancelText: "No",
            onOk() {
                handleAction(action);
            },
            onCancel() {
                // Do nothing if cancelled
            },
        });
    };

    const handleClick = (action: "approve" | "reject" | "unEnroll") => {
        if (skipConfirmations[action]) {
            handleAction(action);
        } else {
            showConfirm(action);
        }
    };

    if (isCompleted) {
        return (
            <div className="flex justify-center max-h-fit">
                <Lottie animationData={approveCheckAnimation} className="w-10"/>
            </div>
        );
    }

    return (
        <>
            <div className="flex gap-2 justify-center">
                {isEnrollPage ? (
                    <>
                        <Button
                            type="primary"
                            onClick={() => handleClick("approve")}
                            loading={buttonsLoadingStates.approve === "loading"}
                            disabled={isLoading || buttonsLoadingStates.approve === "done"}
                        >
                            Approve
                        </Button>
                        <Button
                            danger
                            onClick={() => handleClick("reject")}
                            loading={buttonsLoadingStates.reject === "loading"}
                            disabled={isLoading || buttonsLoadingStates.reject === "done"}
                        >
                            Reject
                        </Button>
                    </>
                ) : (
                    <Button
                        danger
                        onClick={() => handleClick("unEnroll")}
                        loading={buttonsLoadingStates.unEnroll === "loading"}
                        disabled={isLoading || buttonsLoadingStates.unEnroll === "done"}
                    >
                        UnEnroll
                    </Button>
                )}
            </div>
            {contextHolder}
        </>
    );
};

export default memo(ActionButtons);