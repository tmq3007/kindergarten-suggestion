import type React from "react"
import type { ReviewVO } from "@/redux/services/reviewApi"
import { Star, StarHalf } from "lucide-react";

interface AverageRatingSectionProps {
    reviews: ReviewVO[]
}

const AverageRatingSection: React.FC<AverageRatingSectionProps> = ({ reviews = [] }) => {
    const totalRatings = reviews?.length || 0
    const averageRating =
        totalRatings > 0 ? reviews.reduce((sum, review) => sum + (review.average || 0), 0) / totalRatings : 0

    const categoryRatings = {
        learningProgram:
            totalRatings > 0 ? reviews.reduce((sum, review) => sum + (review.learningProgram || 0), 0) / totalRatings : 0,
        facilitiesAndUtilities:
            totalRatings > 0
                ? reviews.reduce((sum, review) => sum + (review.facilitiesAndUtilities || 0), 0) / totalRatings
                : 0,
        extracurricularActivities:
            totalRatings > 0
                ? reviews.reduce((sum, review) => sum + (review.extracurricularActivities || 0), 0) / totalRatings
                : 0,
        teachersAndStaff:
            totalRatings > 0 ? reviews.reduce((sum, review) => sum + (review.teacherAndStaff || 0), 0) / totalRatings : 0,
        hygieneAndNutrition:
            totalRatings > 0 ? reviews.reduce((sum, review) => sum + (review.hygieneAndNutrition || 0), 0) / totalRatings : 0,
    }

    // Custom progress bar component
    const RatingBar = ({ rating }: { rating: number }) => {
        const percentage = (rating / 5) * 100
        return (
            <div className="w-full h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
            </div>
        )
    }

    // Star rating display
    const StarRating = ({ rating }: { rating: number }) => {
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        return (
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-400" />
                ))}
                {hasHalfStar && <StarHalf className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-400" />}
                {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                    <Star
                        key={i + fullStars + (hasHalfStar ? 1 : 0)}
                        className="w-5 h-5 md:w-6 md:h-6 text-amber-400"
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="mb-6 md:mb-8 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Average ratings</h2>

            <div className="flex flex-col items-center mb-4 md:mb-6">
                <div className="text-lg md:text-xl font-semibold mb-2">
                    {averageRating.toFixed(1)} Stars ({totalRatings} Ratings)
                </div>
                <StarRating rating={averageRating} />
            </div>

            <div className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Learning program:</span>
                    <RatingBar rating={categoryRatings.learningProgram} />
                    <span className="text-right text-sm md:text-base">
                        ({categoryRatings.learningProgram.toFixed(1)}/5)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Facilities and Utilities:</span>
                    <RatingBar rating={categoryRatings.facilitiesAndUtilities} />
                    <span className="text-right text-sm md:text-base">
                        ({categoryRatings.facilitiesAndUtilities.toFixed(1)}/5)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Extracurricular Activities:</span>
                    <RatingBar rating={categoryRatings.extracurricularActivities} />
                    <span className="text-right text-sm md:text-base">
                        ({categoryRatings.extracurricularActivities.toFixed(1)}/5)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Teachers and Staff:</span>
                    <RatingBar rating={categoryRatings.teachersAndStaff} />
                    <span className="text-right text-sm md:text-base">
                        ({categoryRatings.teachersAndStaff.toFixed(1)}/5)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_50px] items-center gap-2 md:gap-4">
                    <span className="text-gray-700 text-sm md:text-base">Hygiene and Nutrition:</span>
                    <RatingBar rating={categoryRatings.hygieneAndNutrition} />
                    <span className="text-right text-sm md:text-base">
                        ({categoryRatings.hygieneAndNutrition.toFixed(1)}/5)
                    </span>
                </div>
            </div>
        </div>
    )
}

export default AverageRatingSection