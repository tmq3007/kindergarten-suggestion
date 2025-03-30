import {Button, message} from "antd";
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
interface ActionButtonsProps {
    id?: number;
    onDeleteSuccess?: (id: number) => void;
    isEnrollPage?: boolean;
    isAdminPage?: boolean
}
const ActionButtons = ({id, onDeleteSuccess,isAdminPage = false, isEnrollPage = false}: ActionButtonsProps) => {
    const dispatch = useDispatch();

    const [unenrollTrigger] = useUnEnrollParentMutation();
    const [approveTrigger]  = useEnrollParentMutation();
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
            message.error("No ID provided");
            return;
        }

        setButtonsLoadingStates((prev) => ({...prev, [action]: "loading"}));

        try {
            if (action === "approve") {
                await approveRequest(id);
                message.success("Request approved successfully!");
                dispatch(decrementPendingRequestsCount());
            } else if (action === "reject") {
                await rejectRequest(id);
                message.success("Request rejected successfully!");
                dispatch(decrementPendingRequestsCount());
            } else if (action === "unEnroll") {
                await unEnrollRequest(id);
                message.success("Parent unenrolled successfully!");
            }

            if (onDeleteSuccess) onDeleteSuccess(id);
            setButtonsLoadingStates((prev) => ({...prev, [action]: "done"}));
        } catch (err) {
            message.error(`Failed to ${action} request`);
            setButtonsLoadingStates((prev) => ({...prev, [action]: "idle"}));
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
        <div className="flex gap-2 justify-center">
            {isEnrollPage ? (
                <>
                    <Button
                        type="primary"
                        onClick={() => handleAction("approve")}
                        loading={buttonsLoadingStates.approve === "loading"}
                        disabled={isLoading || buttonsLoadingStates.approve === "done"}
                    >
                        Approve
                    </Button>
                    <Button
                        danger
                        onClick={() => handleAction("reject")}
                        loading={buttonsLoadingStates.reject === "loading"}
                        disabled={isLoading || buttonsLoadingStates.reject === "done"}
                    >
                        Reject
                    </Button>
                </>
            ) : (
                <Button
                    danger
                    onClick={() => handleAction("unEnroll")}
                    loading={buttonsLoadingStates.unEnroll === "loading"}
                    disabled={isLoading || buttonsLoadingStates.unEnroll === "done"}
                >
                    UnEnroll
                </Button>
            )}
        </div>
    );
};
export default memo(ActionButtons);