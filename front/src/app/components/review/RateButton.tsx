"use client";

import { useState } from "react";
import { Button } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetReviewPermissionQuery } from "@/redux/services/reviewApi";
import RatingsPopupWrapper from "@/app/components/review/ReviewPopupWrapper";

interface RateButtonProps {
    schoolId: number;
    schoolName?: string;
}

interface PermissionResponse {
    code: number;
    message: string;
    data: string; // "add", "update", "view", or "hidden"
}

export default function RateButton({ schoolId, schoolName = "School" }: RateButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = useSelector((state: RootState) => state.user?.id);

    const { data: permission, isLoading, error } = useGetReviewPermissionQuery(
        schoolId,
        { skip: !userId }
    );
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const getButtonConfig = () => {
        const permissionValue = permission?.data; // Extract the string from data
        switch (permissionValue) {
            case "add":
                return { text: "Rate School", isUpdate: false, disabled: false };
            case "update":
                return { text: "Update Rating", isUpdate: true, disabled: false };
            case "view":
                return { text: "View Rating", isUpdate: true, disabled: false };
            case "hidden":
            default:
                return null;
        }
    };

    const buttonConfig = getButtonConfig();
    if (!userId || !buttonConfig) {
        return null;
    }

    return (
        <>
            <Button
                type="primary"
                onClick={handleOpenModal}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                size="large"
                disabled={buttonConfig.disabled}
            >
                {buttonConfig.text}
            </Button>

            {isModalOpen && (
                <RatingsPopupWrapper
                    schoolId={schoolId}
                    schoolName={schoolName}
                    isUpdate={buttonConfig.isUpdate}
                    isOpen={isModalOpen}
                    onCloseAction={handleCloseModal}
                    isViewOnly={permission?.data === "view"}
                />
            )}
        </>
    );
}