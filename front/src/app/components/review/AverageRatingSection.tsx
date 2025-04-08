// AverageRatingSection.tsx
"use client";
import React from "react";
import { Star, StarHalf } from "lucide-react";
import {RatingStats} from "@/redux/services/reviewApi";

interface AverageRatingSectionProps {
    dataStat?: RatingStats,
    isLoading: boolean,
    isError: boolean
}

const AverageRatingSection: React.FC<AverageRatingSectionProps> = ({ dataStat,isLoading,isError }) => {

    const defaultStats = {
        averageRating: 0,
        totalRatings: 0,
        ratingsByStarRange: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
        categoryRatings: {
            learningProgram: 0,
            facilitiesAndUtilities: 0,
            extracurricularActivities: 0,
            teachersAndStaff: 0,
            hygieneAndNutrition: 0,
        },
    };

    const stats = dataStat || defaultStats;

    const RatingBar = ({ rating, max }: { rating: number; max: number }) => {
        const percentage = (rating / max) * 100;
        return (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
            </div>
        );
    };

    const StarRating = ({ rating }: { rating: number }) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-400" />
                ))}
                {hasHalfStar && (
                    <StarHalf className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-400" />
                )}
                {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                    <Star
                        key={i + fullStars + (hasHalfStar ? 1 : 0)}
                        className="w-5 h-5 md:w-6 md:h-6 text-amber-400"
                    />
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="mb-6 md:mb-8 md:px-0">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Average ratings</h2>
                <div>Loading statistics...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="mb-6 md:mb-8 md:px-0">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Average ratings</h2>
                <div>Error loading statistics</div>
            </div>
        );
    }

    return (
        <div className="mb-6 md:mb-8 md:px-0">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Average ratings</h2>
            <div className="flex flex-col items-center mb-4 md:mb-6">
                <div className="text-lg md:text-xl font-semibold mb-2">
                    {stats.averageRating.toFixed(1)} Stars ({stats.totalRatings} Ratings)
                </div>
                <StarRating rating={stats.averageRating} />
            </div>

            {/* Category Averages */}
            <div className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Learning program:</span>
                    <RatingBar rating={stats.categoryRatings.learningProgram} max={5} />
                    <span className="text-right text-sm md:text-base">
            ({stats.categoryRatings.learningProgram.toFixed(1)}/5)
          </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Facilities and Utilities:</span>
                    <RatingBar rating={stats.categoryRatings.facilitiesAndUtilities} max={5} />
                    <span className="text-right text-sm md:text-base">
            ({stats.categoryRatings.facilitiesAndUtilities.toFixed(1)}/5)
          </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Extracurricular Activities:</span>
                    <RatingBar rating={stats.categoryRatings.extracurricularActivities} max={5} />
                    <span className="text-right text-sm md:text-base">
            ({stats.categoryRatings.extracurricularActivities.toFixed(1)}/5)
          </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Teachers and Staff:</span>
                    <RatingBar rating={stats.categoryRatings.teachersAndStaff} max={5} />
                    <span className="text-right text-sm md:text-base">
            ({stats.categoryRatings.teachersAndStaff.toFixed(1)}/5)
          </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Hygiene and Nutrition:</span>
                    <RatingBar rating={stats.categoryRatings.hygieneAndNutrition} max={5} />
                    <span className="text-right text-sm md:text-base">
            ({stats.categoryRatings.hygieneAndNutrition.toFixed(1)}/5)
          </span>
                </div>
            </div>
        </div>
    );
};

export default AverageRatingSection;