"use client"

import { useState } from "react"
import { Modal, Rate, Input, Button, Typography, message, Spin, Alert } from "antd"
import { ArrowRightIcon as ArrowRightOutlined, DoorClosedIcon as CloseOutlined } from "lucide-react"
import { motion } from "framer-motion"

const { TextArea } = Input
const { Title, Text } = Typography

interface RatingCategory {
    name: string
    value: number | null
    key: string
    color: string
}

interface RatingsPopupProps {
    schoolId?: number
    schoolName?: string
    isLoading?: boolean
    error?: string
    onSubmit?: (data: {
        schoolId: number
        learningProgram: number
        facilitiesAndUtilities: number
        extracurricularActivities: number
        teacherAndStaff: number
        hygieneAndNutrition: number
        feedback: string
    }) => void
    onCancel?: () => void
}

const COLORS = {
    poor: "#ff4d4f",
    belowAverage: "#faad14",
    average: "#fadb14",
    good: "#52c41a",
    excellent: "#1890ff",
}

export default function RatingsPopup({
                                         schoolId,
                                         schoolName = "School",
                                         isLoading = false,
                                         error,
                                         onSubmit,
                                         onCancel,
                                     }: RatingsPopupProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [feedback, setFeedback] = useState("")
    const [hoveredRating, setHoveredRating] = useState<{ index: number; value: number } | null>(null)
    const [categories, setCategories] = useState<RatingCategory[]>([
        { name: "Learning program:", value: null, key: "learning", color: "#1890ff" },
        { name: "Facilities and Utilities:", value: 3, key: "facilities", color: "#faad14" },
        { name: "Extracurricular Activities:", value: null, key: "activities", color: "#52c41a" },
        { name: "Teachers and Staff:", value: null, key: "teachers", color: "#722ed1" },
        { name: "Hygiene and Nutrition:", value: null, key: "hygiene", color: "#eb2f96" },
    ])

    const [messageApi, contextHolder] = message.useMessage()
    const [submitting, setSubmitting] = useState(false)

    function getColorForRating(value: number) {
        if (value <= 1) return COLORS.poor
        if (value <= 2) return COLORS.belowAverage
        if (value <= 3) return COLORS.average
        if (value <= 4) return COLORS.good
        return COLORS.excellent
    }

    const handleRatingChange = (value: number, index: number) => {
        const newCategories = [...categories]

        // If value is 0, set to null to show the arrow
        if (value === 0) {
            newCategories[index].value = null
            setCategories(newCategories)
            return
        }

        newCategories[index].value = value
        newCategories[index].color = getColorForRating(value)
        setCategories(newCategories)

        // Show feedback message
        const ratingTexts = ["Poor", "Below Average", "Average", "Good", "Excellent"]
        messageApi.open({
            type: value >= 4 ? "success" : value >= 3 ? "info" : value >= 2 ? "warning" : "error",
            content: `${newCategories[index].name} rated ${value} - ${ratingTexts[Math.floor(value) - 1]}`,
            duration: 1.5,
        })
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        }
        setIsOpen(false)
    }

    const handleSubmit = () => {
        if (!schoolId) {
            messageApi.error("School ID is required")
            return
        }

        const unratedCategories = categories.filter((cat) => cat.value === null)

        if (unratedCategories.length > 0) {
            messageApi.warning("Please rate all categories before submitting")
            return
        }

        // Collect the ratings data
        const ratingsData = {
            schoolId,
            learningProgram: categories.find((c) => c.key === "learning")?.value || 0,
            facilitiesAndUtilities: categories.find((c) => c.key === "facilities")?.value || 0,
            extracurricularActivities: categories.find((c) => c.key === "activities")?.value || 0,
            teacherAndStaff: categories.find((c) => c.key === "teachers")?.value || 0,
            hygieneAndNutrition: categories.find((c) => c.key === "hygiene")?.value || 0,
            feedback: feedback,
        }

        setSubmitting(true)

        if (onSubmit) {
            onSubmit(ratingsData)
            // Note: The parent component should handle closing the modal after submission
        } else {
            // Demo mode - simulate submission
            messageApi.success("Thank you for your ratings!")
            console.log("Submitted ratings:", ratingsData)

            // Simulate submission delay
            setTimeout(() => {
                setSubmitting(false)
                setIsOpen(false)
            }, 1500)
        }
    }

    // For demonstration purposes - button to reopen the modal
    const showModal = () => {
        setIsOpen(true)
    }

    const getRatingDescription = (value: number | null) => {
        if (value === null) return ""
        const descriptions = ["Poor", "Below Average", "Average", "Good", "Excellent"]
        return descriptions[Math.floor(value) - 1]
    }

    // Loading state UI
    if (isLoading) {
        return (
            <Modal
                open={isOpen}
                footer={null}
                closable={true}
                closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700 transition-colors" />}
                onCancel={handleCancel}
                width={600}
                centered
                className="ratings-popup"
            >
                <div className="py-12 px-4 flex flex-col items-center justify-center">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-500">Loading school information...</Text>
                </div>
            </Modal>
        )
    }

    // Error state UI
    if (error) {
        return (
            <Modal
                open={isOpen}
                footer={null}
                closable={true}
                closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700 transition-colors" />}
                onCancel={handleCancel}
                width={600}
                centered
                className="ratings-popup"
            >
                <div className="py-6 px-4">
                    <Alert
                        message="Error Loading Data"
                        description={error || "There was a problem loading the school information. Please try again later."}
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleCancel} size="large">
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {contextHolder}
            {/* Only show this button in demo mode when no schoolId is provided */}
            {!schoolId && (
                <Button
                    type="primary"
                    onClick={showModal}
                    className="mb-4 text-lg px-6 py-2 h-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-lg"
                    size="large"
                >
                    Open Ratings Popup
                </Button>
            )}

            <Modal
                open={isOpen}
                footer={null}
                closable={true}
                closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700 transition-colors" />}
                onCancel={handleCancel}
                width={600}
                centered
                className="ratings-popup"
            >
                <div className="py-6 px-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Title
                            level={3}
                            className="text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1"
                        >
                            Rate {schoolName}
                        </Title>
                        <Text className="block text-center text-gray-500 mb-2">
                            Please give specific ratings for the following criteria
                        </Text>
                        <Text className="block text-center text-red-500 text-sm mb-6">* All ratings are required</Text>
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
                                            if (value) {
                                                setHoveredRating({ index, value })
                                            } else {
                                                setHoveredRating(null)
                                            }
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
                                        character={({ index }) => (
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
                            onClick={handleCancel}
                            className="min-w-[120px] border-gray-300 text-gray-500 text-base h-12 hover:text-gray-700 hover:border-gray-400 transition-colors"
                            size="large"
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            className="min-w-[120px] text-base h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-md"
                            size="large"
                            loading={submitting}
                        >
                            Submit
                        </Button>
                    </motion.div>
                </div>
            </Modal>
        </div>
    )
}
