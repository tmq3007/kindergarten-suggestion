import React from "react";
import {Button, Form, Skeleton} from "antd";


const ParentRequestListSkeleton: React.FC = () => {
    return (
        <div className="mx-auto mt-1 px-4 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 items-start max-sm:border-2 max-sm:border-blue-300 max-sm:rounded-lg max-sm:shadow-md p-2 max-sm:bg-gray-50">
                {/* Request Card - Chiếm 3/6 cột */}
                <div
                    className="md:col-span-3 bg-white border-2 border-blue-300 rounded-lg shadow-md p-4 min-h-[300px] h-auto">
                    {/* Nội dung Request */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                        <Skeleton.Input active className={'!w-full'}/>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <Skeleton.Input active className={'!w-full'}/>
                    </div>
                    <div className="mt-2">
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                    </div>
                </div>

                {/* School Section Card */}
                    <div
                        className="md:col-span-2 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-full sm:h-auto">
                        <Skeleton.Input active className={'!w-full'}/>
                        <br/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                    </div>



                    <div
                        className="md:col-span-1 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-full sm:h-auto">
                        <Skeleton.Input active className={'!w-full'}/>
                        <Skeleton.Input active className={'!w-full'}/>
                    </div>


            </div>
        </div>
    );
}

export default ParentRequestListSkeleton;