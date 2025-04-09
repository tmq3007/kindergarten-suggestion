"use client";

import { useEffect, useState } from "react";
import { Modal, Rate, Input, Button, Typography, message, Spin, Alert } from "antd";
import { ArrowRightIcon as ArrowRightOutlined, DoorClosedIcon as CloseOutlined } from "lucide-react";
import { motion } from "framer-motion";
import {ReviewDTO, useSubmitRatingsMutation} from "@/redux/services/reviewApi";
import {useDispatch} from "react-redux";
import {parentApi} from "@/redux/services/parentApi";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface RatingCategory {
    name: string;
    value: number | null;
    key: string;
    color: string;
}

interface RatingsPopupProps {
    schoolId: number;
    schoolName?: string;
    isOpen: boolean;
    onCloseAction: () => void;
    isLoading?: boolean;
    error?: string;
    initialRatings?: {
        id?: number
        schoolId?: number;
        parentId?: number;
        learningProgram: number;
        facilitiesAndUtilities: number;
        extracurricularActivities: number;
        teacherAndStaff: number;
        hygieneAndNutrition: number;
        feedback: string;
    };
    isUpdate?: boolean;
}

const COLORS = {
    poor: "#ff4d4f",
    belowAverage: "#faad14",
    average: "#fadb14",
    good: "#52c41a",
    excellent: "#1890ff",
};

export default function RatingsPopup({
                                         schoolId,
                                         schoolName = "School",
                                         isOpen,
                                         onCloseAction,
                                         isLoading = false,
                                         error,
                                         initialRatings,
                                         isUpdate = false,
                                     }: RatingsPopupProps) {
    const [feedback, setFeedback] = useState(initialRatings?.feedback || "");
    const [hoveredRating, setHoveredRating] = useState<{ index: number; value: number } | null>(null);
    const [categories, setCategories] = useState<RatingCategory[]>([
        { name: "Learning program:", value: null, key: "learning", color: "#1890ff" },
        { name: "Facilities and Utilities:", value: null, key: "facilities", color: "#faad14" },
        { name: "Extracurricular Activities:", value: null, key: "activities", color: "#52c41a" },
        { name: "Teachers and Staff:", value: null, key: "teachers", color: "#722ed1" },
        { name: "Hygiene and Nutrition:", value: null, key: "hygiene", color: "#eb2f96" },
    ]);
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const [submitRatings, { isLoading: isSubmitting, error: submitError }] = useSubmitRatingsMutation();

    // Sync categories with initialRatings whenever it changes
    useEffect(() => {
        if (initialRatings) {
            setCategories([
                { name: "Learning program:", value: initialRatings.learningProgram || null, key: "learning", color: getColorForRating(initialRatings.learningProgram || 0) || "#1890ff" },
                { name: "Facilities and Utilities:", value: initialRatings.facilitiesAndUtilities || null, key: "facilities", color: getColorForRating(initialRatings.facilitiesAndUtilities || 0) || "#faad14" },
                { name: "Extracurricular Activities:", value: initialRatings.extracurricularActivities || null, key: "activities", color: getColorForRating(initialRatings.extracurricularActivities || 0) || "#52c41a" },
                { name: "Teachers and Staff:", value: initialRatings.teacherAndStaff || null, key: "teachers", color: getColorForRating(initialRatings.teacherAndStaff || 0) || "#722ed1" },
                { name: "Hygiene and Nutrition:", value: initialRatings.hygieneAndNutrition || null, key: "hygiene", color: getColorForRating(initialRatings.hygieneAndNutrition || 0) || "#eb2f96" },
            ]);
            setFeedback(initialRatings.feedback || "");
        }
    }, [initialRatings]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCategories([
                { name: "Learning program:", value: null, key: "learning", color: "#1890ff" },
                { name: "Facilities and Utilities:", value: null, key: "facilities", color: "#faad14" },
                { name: "Extracurricular Activities:", value: null, key: "activities", color: "#52c41a" },
                { name: "Teachers and Staff:", value: null, key: "teachers", color: "#722ed1" },
                { name: "Hygiene and Nutrition:", value: null, key: "hygiene", color: "#eb2f96" },
            ]);
            setFeedback("");
            setHoveredRating(null);
        }
    }, [isOpen]);

    // Handle submission error
    useEffect(() => {
        if (submitError) {
            const errorMessage =
                "code" in submitError
                    ? `Error ${submitError.code}: Failed to submit ratings`
                    : "Network error occurred while submitting ratings";
            messageApi.error(errorMessage);
        }
    }, [submitError, messageApi]);

    function getColorForRating(value: number) {
        if (value <= 1) return COLORS.poor;
        if (value <= 2) return COLORS.belowAverage;
        if (value <= 3) return COLORS.average;
        if (value <= 4) return COLORS.good;
        return COLORS.excellent;
    }

    const handleRatingChange = (value: number, index: number) => {
        const newCategories = [...categories];
        if (value === 0) {
            newCategories[index].value = null;
            newCategories[index].color = categories[index].color; // Reset to default color
        } else {
            newCategories[index].value = value;
            newCategories[index].color = getColorForRating(value);
        }
        setCategories(newCategories);
    };

    const handleSubmit = () => {
        if (!schoolId && !initialRatings?.schoolId) {
            messageApi.error("School ID is required");
            return;
        }

        const unratedCategories = categories.filter((cat) => cat.value === null);
        if (unratedCategories.length > 0) {
            messageApi.warning("Please rate all categories before submitting");
            return;
        }

        const ratingsData : ReviewDTO = {
            id: initialRatings?.id,
            schoolId: schoolId || initialRatings?.schoolId || -1,
            learningProgram: categories.find((c) => c.key === "learning")?.value || 0,
            facilitiesAndUtilities: categories.find((c) => c.key === "facilities")?.value || 0,
            extracurricularActivities: categories.find((c) => c.key === "activities")?.value || 0,
            teacherAndStaff: categories.find((c) => c.key === "teachers")?.value || 0,
            hygieneAndNutrition: categories.find((c) => c.key === "hygiene")?.value || 0,
            feedback: feedback
        };

        submitRatings(ratingsData)
            .unwrap()
            .then(() => {
                messageApi.success("Thank you for your ratings!");
                dispatch(parentApi.util.invalidateTags(['AcademicHistory']));
                setTimeout(() => {
                    onCloseAction();
                }, 1500);
            })
            .catch(() => {
                // Error handling is managed by the useEffect above
            });
    };

    const getRatingDescription = (value: number | null) => {
        if (value === null) return "";
        const descriptions = ["Poor", "Below Average", "Average", "Good", "Excellent"];
        return descriptions[Math.floor(value) - 1];
    };

    return (
        <div>
            {contextHolder}
            <Modal
                open={isOpen}
                footer={null}
                closable={true}
                closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700 transition-colors" />}
                onCancel={onCloseAction}
                width={650}
                centered
                className="ratings-popup"
            >
                <div className="py-6 px-4">
                    {isLoading ? (
                        <Spin tip="Loading..." />
                    ) : error ? (
                        <div>
                            <Alert message="Error Loading Data" description={error} type="error" showIcon className="mb-4" />
                            <Button onClick={onCloseAction} size="large">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <>
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <Title level={3} className="text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                                    Rate {schoolName}
                                </Title>
                                <Text className="block text-center text-gray-500 mb-2">
                                    Please give specific ratings for the following criteria
                                </Text>
                            </motion.div>

                            <div className="space-y-6 mb-8">
                                {categories.map((category, index) => (
                                    <motion.div
                                        key={category.key}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <Text className="min-w-[180px] text-gray-700 font-medium">
                                            {category.name} <span className="text-red-500">*</span>
                                        </Text>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            {category.value === null || category.value === 0 ? (
                                                <div className="bg-gray-800 text-white p-1 rounded-md">
                                                    <ArrowRightOutlined className="h-5 w-5" />
                                                </div>
                                            ) : (
                                                <motion.div
                                                    className="flex items-center gap-2"
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <div
                                                        className="text-white px-3 py-1 rounded-md text-lg font-bold"
                                                        style={{ backgroundColor: category.color }}
                                                    >
                                                        {category.value.toFixed(1)}
                                                    </div>
                                                    <Text className="text-sm" style={{ color: category.color }}>
                                                        {getRatingDescription(category.value)}
                                                    </Text>
                                                </motion.div>
                                            )}
                                            <Rate
                                                value={category.value || 0}
                                                onChange={(value) => handleRatingChange(value, index)}
                                                onHoverChange={(value) => {
                                                    if (value) setHoveredRating({ index, value });
                                                    else setHoveredRating(null);
                                                }}
                                                allowClear={true}
                                                className={`text-3xl ${category.value ? "" : "text-gray-300"}`}
                                                style={{
                                                    color:
                                                        hoveredRating?.index === index
                                                            ? getColorForRating(hoveredRating.value)
                                                            : category.value
                                                                ? category.color
                                                                : undefined,
                                                }}
                                                key={category.key}
                                                character={() => (
                                                    <motion.span whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300 }}>
                                                        ★
                                                    </motion.span>
                                                )}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <Text className="block mb-2 text-gray-700 font-medium">
                                    Feedback: <span className="text-gray-400 text-sm">(optional)</span>
                                </Text>
                                <TextArea
                                    rows={4}
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="bg-gray-50 border-gray-200 rounded-lg text-base p-3 transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                                    placeholder="Please share your thoughts and suggestions..."
                                />
                            </motion.div>

                            <motion.div
                                className="flex flex-col sm:flex-row justify-between gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <Button
                                    onClick={onCloseAction}
                                    className="min-w-[120px] border-gray-300 text-gray-500 text-base h-12 hover:text-gray-700 hover:border-gray-400 transition-colors"
                                    size="large"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    className="min-w-[120px] text-base h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-md"
                                    size="large"
                                    loading={isSubmitting}
                                >
                                    {isUpdate ? "Update" : "Rate"}
                                </Button>
                            </motion.div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}