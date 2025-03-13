import React from 'react';
import {Skeleton, Typography, Upload} from 'antd';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";

const {Title} = Typography;


const ProfileSidebar: React.FC = () => {
    return (
        <div className="h-full p-6 rounded-xl flex flex-col items-center space-y-6">
            <div className="w-full">
                <MyBreadcrumb paths={[
                    {label: 'Home', href: '/public'},
                    {label: 'My Profile'}
                ]}/>
            </div>

            <h4 className="text-lg mt-0 font-semibold">
                My Profile
            </h4>

            <div className="flex flex-col items-center space-y-3">
                <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    className="text-center"
                >
                    <Skeleton.Avatar active={true}
                                     size={150}
                                     className="cursor-pointer border-4 border-white mx-auto"
                    />
                </Upload>
            </div>

            <div className="text-center space-y-2 w-full max-w-xs">
                <Title level={2}>
                    <Skeleton.Input active={true} className={'!w-4/5'}/>
                </Title>
            </div>

            <div className="w-full text-left max-w-xs flex flex-col items-start space-y-4">
                <Skeleton.Input active={true} className={'!w-full'}/>
                <Skeleton.Input active={true} className={'!w-full'}/>
                <Skeleton.Input active={true} className={'!w-full'}/>
            </div>
        </div>
    );
};

export default ProfileSidebar;