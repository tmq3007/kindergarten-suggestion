
"use client";

import { useDispatch } from "react-redux";
import RatingsPopup from "@/app/components/review/ReviewPopup";

interface RatingsPopupWrapperProps {
    schoolId: number;
    onClose?: () => void; // Optional callback when popup closes
}

export default function RatingsPopupWrapper({ schoolId, onClose }: RatingsPopupWrapperProps) {
    // Fetch school details
    const {
        data: schoolData,
        isLoading: isFetching,
        error: fetchError
    } = useGetSchoolDetailsQuery(schoolId);

    // Submit ratings mutation
    const [submitRatings, { isLoading: isSubmitting, error: submitError }] = useSubmitRatingsMutation();

    const dispatch = useDispatch();

    // Handle submission
    const handleSubmit = async (ratingsData: {
        schoolId: number;
        learningProgram: number;
        facilitiesAndUtilities: number;
        extracurricularActivities: number;
        teacherAndStaff: number;
        hygieneAndNutrition: number;
        feedback: string;
    }) => {
        try {
            await submitRatings(ratingsData).unwrap();
            // Reset RTK Query cache for this school if needed
            // dispatch(ratingsApi.util.invalidateTags([{ type: 'School', id: schoolId }]));
            if (onClose) onClose();
        } catch (err) {
            console.error("Submission failed:", err);
        }
    };

    // Handle cancel/close
    const handleCancel = () => {
        if (onClose) onClose();
    };

    // Convert fetch error to string
    const errorMessage = fetchError
        ? 'status' in fetchError
            ? `Error ${fetchError.status}: Failed to fetch school data`
            : 'Network error occurred'
        : submitError
            ? 'status' in submitError
                ? `Error ${submitError.status}: Failed to submit ratings`
                : 'Submission error occurred'
            : undefined;

    return (
        <RatingsPopup
            schoolId={schoolId}
            schoolName={schoolData?.name || "School"}
            isLoading={isFetching || isSubmitting}
            error={errorMessage}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    );
}