import React from "react";
import { Tabs } from "antd";
import {Star} from "lucide-react";

interface ReviewFilterTabsProps {
    onTabChange: (key: string) => void;
}
const ReviewFilterTabs: React.FC<ReviewFilterTabsProps> = ({ onTabChange }) => {
    return (
        <div className="mt-8">
            <div className="flex gap-2 overflow-x-auto">
                <button className="bg-amber-300 text-amber-800 px-4 py-1 rounded-full font-medium">All</button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-1 rounded-full flex items-center gap-1">
                    <span>5</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-1 rounded-full flex items-center gap-1">
                    <span>4</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-1 rounded-full flex items-center gap-1">
                    <span>3</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-1 rounded-full flex items-center gap-1">
                    <span>2</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-1 rounded-full flex items-center gap-1">
                    <span>1</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </button>
            </div>
        </div>
    );
};

export default ReviewFilterTabs;