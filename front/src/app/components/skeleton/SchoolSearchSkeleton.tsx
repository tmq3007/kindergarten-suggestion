import React from "react";
import {Skeleton} from "antd";

export default function SchoolSearchSkeleton() {
    const skeletonItems = Array(10).fill(null);
    return (
        <div className="space-y-4">
            {skeletonItems.map((_, index) => (
                <div
                    key={index}
                    className="flex w-full h-[200px] p-5 border rounded mb-4 shadow-sm hover:shadow-md transition-shadow bg-gray-100 animate-pulse"
                >
                    <div className={'w-1/3 pr-5'}>
                        <Skeleton.Image active className={'!w-full !h-full'}/>
                    </div>
                    <div className={'w-2/3'}>
                        <Skeleton active/>
                    </div>
                </div>
            ))}
        </div>
    );

}