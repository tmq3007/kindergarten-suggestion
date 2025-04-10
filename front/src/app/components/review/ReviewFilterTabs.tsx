"use client";

import {useState} from "react"
import type React from "react"
import {Radio, Badge, Flex} from "antd"
import {Star} from "lucide-react";
import {RatingStats} from "@/redux/services/reviewApi";

interface ReviewFilterTabsProps {
    onTabChange: (key: string) => void;
    statsData?: RatingStats;
    isLoading: boolean;
}

const defaultStats = {
    ratingsByStarRange: {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
    totalRatings: 0,
};

const ReviewFilterTabs: React.FC<ReviewFilterTabsProps> = ({ onTabChange, statsData, isLoading }) => {
    const [selectedTab, setSelectedTab] = useState("all");
    const stats = statsData || defaultStats;
    const tabOptions = [
        { key: "all", label: "All", count: stats.totalRatings },
        { key: "5", label: "5", count: stats.ratingsByStarRange["5"] },
        { key: "4", label: "4", count: stats.ratingsByStarRange["4"] },
        { key: "3", label: "3", count: stats.ratingsByStarRange["3"] },
        { key: "2", label: "2", count: stats.ratingsByStarRange["2"] },
        { key: "1", label: "1", count: stats.ratingsByStarRange["1"] },
    ];

    const customStyles = `
        .review-filter-tabs .ant-radio-button-wrapper {
            border-radius: 999px !important;
        }
        .review-filter-tabs .ant-radio-button-wrapper:first-child {
            border-radius: 999px !important;
        }
        .review-filter-tabs .ant-radio-button-wrapper:last-child {
            border-radius: 999px !important;
        }
        .review-filter-tabs .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
            color: black !important;
            background: #fcd34d !important;
            border-color: #fcd34d !important;
        }
        .review-filter-tabs .ant-radio-button-wrapper:hover {
            color: black !important;
        }
        .review-filter-tabs .ant-badge-count {
            background-color: #f59e0b !important;
            color: white !important;
            font-size: 10px !important;
            height: 16px !important;
            line-height: 16px !important;
            padding: 0 4px !important;
        }
    `;

    const handleChange = (e: any) => {
        setSelectedTab(e.target.value);
        onTabChange(e.target.value);
    };

    return (
        <div className="mt-8 review-filter-tabs">
            <style>{customStyles}</style>
            <Radio.Group
                onChange={handleChange}
                value={selectedTab}
                defaultValue={"all"}
                buttonStyle="solid"
                className="flex gap-2"
                style={
                    {
                        "--ant-primary-color": "#fcd34d",
                        "--ant-primary-color-hover": "#fcd34d",
                    } as React.CSSProperties
                }
            >
                {tabOptions.map((tab) => (
                    <Badge key={tab.key} count={tab.count} showZero>
                        <Radio.Button
                            value={tab.key}
                            className={`
                            w-0 md:w-full
                            flex items-center justify-center gap-1 text-sm font-medium
                            rounded-full px-4 py-1.5 transition-all
                            border border-amber-300
                            ${selectedTab === tab.key ? "bg-amber-300 text-black" : "text-amber-400"}
                            `}
                            key={tab.key}
                        >
                            <Flex align="center" gap={4}>
                                {tab.label}
                                {tab.key !== "all" && (
                                    <Star className="w-2 h-2 md:w-5 md:h-5 fill-amber-400 text-amber-400"/>
                                )}
                            </Flex>
                        </Radio.Button>
                    </Badge>
                ))}
            </Radio.Group>
        </div>
    );
};

export default ReviewFilterTabs;