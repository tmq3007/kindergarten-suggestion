"use client";
import React from "react";
import { Star, StarHalf } from "lucide-react";
import { RatingStats } from "@/redux/services/reviewApi";
import {ConfigProvider, Rate} from "antd";

interface AverageRatingSectionProps {
    dataStat?: RatingStats;
    isLoading: boolean;
    isError: boolean;
}

const AverageRatingSection: React.FC<AverageRatingSectionProps> = ({ dataStat, isLoading, isError }) => {
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

    const stats = dataStat !== undefined ? dataStat : defaultStats;

    const RatingBar = ({ rating, max }: { rating: number; max: number }) => {
        const percentage = (rating / max) * 100;
        return (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
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
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Average ratings</h2>
            <div className="flex flex-col items-center mb-4 md:mb-6">
                <div className="text-lg md:text-xl font-semibold mb-2">
                    {stats.averageRating.toFixed(1)} Stars ({stats.totalRatings} Ratings)
                </div>
                <ConfigProvider
                    theme={{
                        components: {
                            Rate: {
                                starSize: 40,
                                starColor: "#fbbf24"
                            },
                        },
                    }}
                >
                    <Rate defaultValue={stats.averageRating} disabled allowHalf/>

                </ConfigProvider>
            </div>

            <div className="md:w-1/2 mx-auto">
                <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                        <span className="text-gray-700 text-sm md:text-base">Learning program:</span>
                        <RatingBar rating={stats.categoryRatings.learningProgram ?? 0} max={5} />
                        <span className="text-right text-sm md:text-base">
                            ({(stats.categoryRatings.learningProgram ?? 0).toFixed(1)}/5)
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                        <span className="text-gray-700 text-sm md:text-base">Facilities and Utilities:</span>
                        <RatingBar rating={stats.categoryRatings.facilitiesAndUtilities ?? 0} max={5} />
                        <span className="text-right text-sm md:text-base">
                            ({(stats.categoryRatings.facilitiesAndUtilities ?? 0).toFixed(1)}/5)
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                        <span className="text-gray-700 text-sm md:text-base">Extracurricular Activities:</span>
                        <RatingBar rating={stats.categoryRatings.extracurricularActivities ?? 0} max={5} />
                        <span className="text-right text-sm md:text-base">
                            ({(stats.categoryRatings.extracurricularActivities ?? 0).toFixed(1)}/5)
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                        <span className="text-gray-700 text-sm md:text-base">Teachers and Staff:</span>
                        <RatingBar rating={stats.categoryRatings.teachersAndStaff ?? 0} max={5} />
                        <span className="text-right text-sm md:text-base">
                            ({(stats.categoryRatings.teachersAndStaff ?? 0).toFixed(1)}/5)
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                        <span className="text-gray-700 text-sm md:text-base">Hygiene and Nutrition:</span>
                        <RatingBar rating={stats.categoryRatings.hygieneAndNutrition ?? 0} max={5} />
                        <span className="text-right text-sm md:text-base">
                            ({(stats.categoryRatings.hygieneAndNutrition ?? 0).toFixed(1)}/5)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AverageRatingSection;