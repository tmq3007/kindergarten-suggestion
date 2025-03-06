import React, { useState } from 'react';
import { Breadcrumb, Avatar, Typography, Upload, message } from 'antd';
import Link from 'next/link';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ProfileSidebarProps {
    fullname: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    dob: string | undefined;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ fullname, email, phone, dob }) => {
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
        <div className="h-full bg-teal-100 bg-opacity-0 p-6 rounded-xl flex flex-col items-center space-y-6">
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
            <Title level={3} className="text-black">My Profile</Title>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-3">

                <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleUpload}
                >
                    <Avatar
                        size={100}
                        src={avatar}
                        icon={<UserOutlined />}
                        className="cursor-pointer border-4 border-white shadow-lg"
                    />
                </Upload>
            </div>

            {/* Profile Info */}
            <div className="text-center space-y-2 w-full max-w-xs">
                <Title level={4} className="text-black">{fullname || 'N/A'}</Title>
                <p className="text-gray-500">{email || 'N/A'}</p>
            </div>

            {/* Additional Info */}
            <div className="w-full text-center max-w-xs space-y-4">
                <div>
                    <label className="text-black font-medium block mb-1">Date of Birth</label>
                    <p className="text-gray-500 p-2 rounded-lg">{dob || 'N/A'}</p>
                </div>
                <div>
                    <label className="text-black font-medium block mb-1">Phone Number</label>
                    <p className="text-gray-500 p-2 rounded-lg">{phone || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;