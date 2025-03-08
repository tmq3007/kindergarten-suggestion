import React, { useState } from 'react';
import { Breadcrumb, Avatar, Typography, Upload, message, Skeleton } from 'antd';
import Link from 'next/link';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ProfileSidebarProps {
    fullname?: string;
    email?: string;
    phone?: string;
    dob?: string;
    loading?: boolean;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ( ) => {
    const [avatar, setAvatar] = useState<string | undefined>('/bg3.jpg');

    const handleUpload = (info: any) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            setAvatar(URL.createObjectURL(info.file.originFileObj));
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    return (
        <div className="h-full bg-blue-50 p-6 rounded-xl flex flex-col items-center space-y-6">
            {/* Breadcrumb */}
            <div className="w-full">
                <Breadcrumb
                    className="text-black"
                    items={[
                        { title: <Link href="/public" className="text-blue-600 hover:underline">Home</Link> },
                        { title: 'My Profile' },
                    ]}
                />
            </div>

            {/* Profile Title */}
            <Skeleton active  title={{ width: 120 }}>
                <Title level={3} className="text-black">My Profile</Title>
            </Skeleton>

            {/* Avatar Upload */}
            <Skeleton.Avatar   active size={100} shape="circle" >

            </Skeleton.Avatar>

            {/* Profile Info */}
            <Skeleton active  title={{ width: 180 }} paragraph={false}>
                <div className="text-center space-y-2 w-full max-w-xs">

                </div>
            </Skeleton>

            {/* Additional Info */}
            <div className="w-full text-center max-w-xs space-y-4">
                <Skeleton active  paragraph={{ rows: 1 }}>
                    <div>

                    </div>
                </Skeleton>
                <Skeleton active  paragraph={{ rows: 1 }}>
                    <div>

                    </div>
                </Skeleton>
            </div>
        </div>
    );
};

export default ProfileSidebar;
