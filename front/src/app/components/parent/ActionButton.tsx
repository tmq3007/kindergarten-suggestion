
import {Button, message} from "antd";
import {useState} from "react";
import {useDeleteParentRequestMutation} from "@/redux/services/parentApi";
import {useDispatch} from "react-redux";
import {decrementPendingRequestsCount} from "@/redux/features/parentSlice";
import Lottie from "lottie-react";
import approveCheckAnimation from "@public/lottie/CheckedAnimation.json";

interface ActionButtonsProps {
    id: number;
    onDeleteSuccess?: (id: number) => void;
}

export const ActionButtons = ({id, onDeleteSuccess}: ActionButtonsProps) => {
    const dispatch = useDispatch();
    const [deletePIS] = useDeleteParentRequestMutation();
    const [buttonsLoadingStates, setButtonsLoadingStates] = useState<{
        approve: "idle" | "loading" | "done";
        reject: "idle" | "loading" | "done";
    }>({
        approve: "idle",
        reject: "idle",
    });

    const isCompleted = buttonsLoadingStates.approve === "done" || buttonsLoadingStates.reject === "done";
    const isLoading = buttonsLoadingStates.approve === "loading" || buttonsLoadingStates.reject === "loading";

    const approveRequest = async (id: number) => {
        return deletePIS(id);
    };

    const rejectRequest = async (id: number) => {
        return new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    };

    const handleAction = async (action: "approve" | "reject") => {
        if (!id) {
            message.error("No ID provided");
            return;
        }

        setButtonsLoadingStates((prev) => ({
            ...prev,
            [action]: "loading",
        }));

        try {
            if (action === "approve") {
                await approveRequest(id);
                message.success("Request approved successfully!");
            } else {
                await rejectRequest(id);
                message.success("Request rejected successfully!");
            }

            if (onDeleteSuccess) onDeleteSuccess(id);

            setButtonsLoadingStates((prev) => ({
                ...prev,
                [action]: "done",
            }));
        } catch (err) {
            message.error(`Failed to ${action} request`);
            setButtonsLoadingStates((prev) => ({
                ...prev,
                [action]: "idle",
            }));
        }
    };
    if (isCompleted) return (
        <div className="flex justify-center max-h-fit">
            <Lottie animationData={approveCheckAnimation} className="w-10"/>
        </div>
    );
    return (
        <div className="flex gap-2 justify-end">
            {/* Approve Button */}
            <Button
                type="primary"
                onClick={() => handleAction("approve")}
                loading={buttonsLoadingStates.approve === "loading"}
                disabled={isLoading || buttonsLoadingStates.approve === "done"}
            >
                {buttonsLoadingStates.approve === "done" ? null : "Check"}
            </Button>

            {/* Reject Button */}
            <Button
                danger
                onClick={() => handleAction("reject")}
                loading={buttonsLoadingStates.reject === "loading"}
                disabled={isLoading || buttonsLoadingStates.reject === "done"}
            >
                {buttonsLoadingStates.reject === "done" ? null : "Close"}
            </Button>
        </div>
    );
};
