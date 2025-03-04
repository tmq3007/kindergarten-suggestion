import React from "react";
import { Empty } from "antd";

const NoData = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Empty
                description={
                    <span className="text-gray-500">No reviews available for the selected date range or school.</span>
                }
            />
        </div>
    );
};

export default NoData;