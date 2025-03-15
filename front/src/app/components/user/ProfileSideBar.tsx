import React, { useState, useEffect } from 'react';
import { Breadcrumb, Avatar, Typography, Upload, message, Image, Button } from 'antd';
import { CalendarOutlined, MailOutlined, PhoneOutlined, UserOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { motion } from "framer-motion";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { lato } from "@/lib/fonts";

const { Title } = Typography;

interface ProfileSidebarProps {
    fullname: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    dob: string | undefined;
    avatarUrl?: string | undefined;
    onAvatarChange?: (file: File) => void;
    openNotificationWithIcon: (type: 'success' | 'error', message: string, description: string) => void; // Thêm prop
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
                                                           fullname,
                                                           email,
                                                           phone,
                                                           dob,
                                                           avatarUrl,
                                                           onAvatarChange,
                                                           openNotificationWithIcon
                                                       }) => {
    const [avatar, setAvatar] = useState<string | undefined>(avatarUrl);
    const [fileList, setFileList] = useState<any[]>([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (avatarUrl) {
            setAvatar(avatarUrl);
        }
    }, [avatarUrl]);

    const handleUpload = (info: any) => {
        const file = info.file as File;
        const allowedFormats = ['image/jpeg', 'image/jpg'];
        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (!allowedFormats.includes(file.type)) {
            openNotificationWithIcon('error', 'Upload Failed!', 'Only JPG and JPEG formats are allowed.');
            return;
        }

        if (file.size > maxSizeBytes) {
            openNotificationWithIcon('error', 'Upload Failed!', `File size must not exceed ${maxSizeMB}MB.`);
            return;
        }

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatar(previewUrl);
            setFileList([info.file]);
            if (onAvatarChange) {
                onAvatarChange(file);
            }
            message.success(`${file.name} uploaded successfully`);
        }
    };

    const handlePreview = () => {
        setPreviewVisible(true);
    };

    return (
        <div className="h-full p-6 rounded-xl flex flex-col items-center space-y-4">
            <div className="w-full">
                <MyBreadcrumb paths={[
                    { label: 'Home', href: '/public' },
                    { label: 'My Profile' }
                ]} />
            </div>

            <motion.h1
                initial={{ color: "#019376" }}
                animate={{ color: ["#3f51b5", "#019376"] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`text-lg mt-0 !font-bold ${lato.className}`}
            >
                My Profile
            </motion.h1>

            <div className="flex flex-col items-center space-y-3">
                <div
                    style={{ position: 'relative', display: 'inline-block' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Avatar
                        size={150}
                        src={avatar}
                        icon={<UserOutlined />}
                        className="border-4 border-white shadow-lg mx-auto"
                    />
                    {isHovered && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                gap: '8px',
                                zIndex: 10,
                            }}
                        >
                            <Upload
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleUpload}
                                fileList={fileList}
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    shape="circle"
                                    size="small"
                                    style={{ backgroundColor: '#1890ff', color: '#fff' }}
                                />
                            </Upload>
                            {avatar && (
                                <Button
                                    icon={<EyeOutlined />}
                                    shape="circle"
                                    size="small"
                                    style={{ backgroundColor: '#1890ff', color: '#fff' }}
                                    onClick={handlePreview}
                                />
                            )}
                        </div>
                    )}
                </div>

                {avatar && (
                    <Image
                        width={0}
                        height={0}
                        style={{ display: 'none' }}
                        src={avatar}
                        preview={{
                            visible: previewVisible,
                            src: avatar,
                            onVisibleChange: (visible) => setPreviewVisible(visible),
                        }}
                    />
                )}
            </div>

            <div className="text-center space-y-2 w-full max-w-xs">
                <Title level={2} className={`${lato.className} text-black`}>
                    {fullname || 'N/A'}
                </Title>
            </div>

            <div className="w-full text-left max-w-xs flex flex-col items-start space-y-4">
                <div className="flex items-center justify-center space-x-2">
                    <label className="text-black font-medium">
                        <MailOutlined className="mr-2" />
                        Email: {email || 'N/A'}
                    </label>
                </div>
                <div className="flex items-center justify-center space-x-2">
                    <label className="text-black font-medium">
                        <CalendarOutlined className="mr-2" />
                        Date of Birth:
                    </label>
                    <p className="text-black font-medium">{dob || 'N/A'}</p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                    <label className="text-black font-medium">
                        <PhoneOutlined className="mr-2" />
                        Phone Number:
                    </label>
                    <p className="text-black font-medium">{phone || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;