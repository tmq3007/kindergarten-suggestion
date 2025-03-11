import React, { useState, useEffect } from 'react';
import { Breadcrumb, Avatar, Typography, Upload, message } from 'antd';
import Link from 'next/link';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ProfileSidebarProps {
    fullname: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    dob: string | undefined;
    avatarUrl?: string | undefined;
    onAvatarChange?: (file: File) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ fullname, email, phone, dob, avatarUrl, onAvatarChange }) => {
    const [avatar, setAvatar] = useState<string | undefined>(avatarUrl || '/bg3.jpg');
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (avatarUrl) {
            setAvatar(avatarUrl);
        }
    }, [avatarUrl]);

    const handleUpload = (info: any) => {
        const file = info.file as File;
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatar(previewUrl);
            setFileList([info.file]); // Cập nhật file trong uploader (dù không hiển thị)
            if (onAvatarChange) {
                onAvatarChange(file);
            }
            message.success(`${file.name} uploaded successfully`);
        }
    };

    return (
        <div className="h-full bg-teal-100 bg-opacity-0 p-6 rounded-xl flex flex-col items-center space-y-6">
            <div className="w-full">
                <Breadcrumb
                    className="text-black"
                    items={[
                        { title: <Link href="/public" className="text-blue-600 hover:underline">Home</Link> },
                        { title: 'My Profile' },
                    ]}
                />
            </div>

            <Title level={3} className="text-black">My Profile</Title>

            <div className="flex flex-col items-center space-y-3">
                <Upload
                    showUploadList={false} // Tắt hoàn toàn danh sách file để không hiển thị tên file
                    beforeUpload={() => false}
                    onChange={handleUpload}
                    fileList={fileList}
                    className="text-center" // Đảm bảo căn giữa
                >
                    <Avatar
                        size={100}
                        src={avatar}
                        icon={<UserOutlined />}
                        className="cursor-pointer border-4 border-white shadow-lg mx-auto" // `mx-auto` để căn giữa
                    />
                </Upload>
            </div>

            <div className="text-center space-y-2 w-full max-w-xs">
                <Title level={4} className="text-black">{fullname || 'N/A'}</Title>
                <Title level={4} className="text-black">{email || 'N/A'}</Title>
            </div>

            <div className="w-full text-center max-w-xs space-y-4">
                <div>
                    <label className="text-black font-medium block mb-1">Date of Birth</label>
                    <p className="text-gray-500 p-2 rounded-lg font-medium">{dob || 'N/A'}</p>
                </div>
                <div>
                    <label className="text-black font-medium block mb-1">Phone Number</label>
                    <p className="text-gray-500 p-2 rounded-lg font-medium">{phone || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;