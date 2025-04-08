import { useMemo } from "react";
import { ReviewVO } from "@/redux/services/reviewApi";


interface CategoryRatings {
    averageRating: number;
    totalRatings: number;
    categoryRatings: {
        learningProgram: number;
        facilitiesAndUtilities: number;
        extracurricularActivities: number;
        teachersAndStaff: number;
        hygieneAndNutrition: number;
    };
}
const useAverageRatings = (reviews: ReviewVO[]): CategoryRatings => {
    return useMemo(() => {
        const totalRatings = reviews?.length || 0;

        const getAvg = (key: keyof ReviewVO) =>
            totalRatings > 0
                ? reviews.reduce((sum, review) => sum + Number(review[key] || 0), 0) / totalRatings
                : 0;

        const averageRating = getAvg("average");

        const categoryRatings = {
            learningProgram: getAvg("learningProgram"),
            facilitiesAndUtilities: getAvg("facilitiesAndUtilities"),
            extracurricularActivities: getAvg("extracurricularActivities"),
            teachersAndStaff: getAvg("teacherAndStaff"),
            hygieneAndNutrition: getAvg("hygieneAndNutrition"),
        };

        return { averageRating, totalRatings, categoryRatings };
    }, [reviews]);
};


const useAverageRating = (review: ReviewVO): number => {
    return useMemo(() => {
        const ratings = [
            review.learningProgram,
            review.facilitiesAndUtilities,
            review.extracurricularActivities,
            review.teacherAndStaff,
            review.hygieneAndNutrition,
        ];

        const validRatings = ratings.filter((r) => typeof r === "number");
        const sum = validRatings.reduce((acc, curr) => acc + curr, 0);

        return validRatings.length ? sum / validRatings.length : 0;
    }, [review]);
};

export {useAverageRating,useAverageRatings};