"use client";

import { useDispatch } from "react-redux";
import RatingsPopup from "@/app/components/review/ReviewPopup";
import { useGetReviewBySchoolAndParentQuery } from "@/redux/services/reviewApi";

interface RatingsPopupWrapperProps {
    schoolId: number;
    schoolName?: string;
    isUpdate: boolean;
    isOpen: boolean;
    onCloseAction: () => void;
    parentId: number;
}

export default function RatingsPopupWrapper({
                                                schoolId,
                                                schoolName,
                                                isUpdate,
                                                isOpen,
                                                onCloseAction,
                                                parentId
                                            }: RatingsPopupWrapperProps) {
    const dispatch = useDispatch();

    // Fetch data only when the modal is open and isUpdate is true
    const {
        data: reviewData,
        isLoading: isFetching,
        error: fetchError,
    } = useGetReviewBySchoolAndParentQuery(
        { schoolId, parentId: parentId! },
        { skip: !isOpen || !isUpdate || !parentId } // Fetch only when modal is open
    );

    // Convert fetch error to string
    const errorMessage =
        fetchError
            ? "status" in fetchError
                ? `Error ${fetchError.status}: Failed to fetch review data`
                : "Network error occurred"
            : undefined;

    // Prepare initial ratings data if updating
    const initialRatings = isUpdate && reviewData?.data
        ? {
            id: reviewData.data.id,
            parentId: reviewData.data.parentId || parentId,
            schoolId: reviewData.data.schoolId || schoolId,
            learningProgram: reviewData.data.learningProgram,
            facilitiesAndUtilities: reviewData.data.facilitiesAndUtilities,
            extracurricularActivities: reviewData.data.extracurricularActivities,
            teacherAndStaff: reviewData.data.teacherAndStaff,
            hygieneAndNutrition: reviewData.data.hygieneAndNutrition,
            feedback: reviewData.data.feedback,
        }
        : undefined;

    return (
        <RatingsPopup
            schoolId={schoolId}
            parentId={parentId}
            schoolName={schoolName || reviewData?.data?.schoolName || "School"}
            isOpen={isOpen}
            onCloseAction={onCloseAction}
            isLoading={isFetching}
            error={errorMessage}
            initialRatings={initialRatings}
            isUpdate={isUpdate}
        />
    );
}