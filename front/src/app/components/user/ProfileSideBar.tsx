import React, {useState, useEffect} from 'react';
import {Breadcrumb, Avatar, Typography, Upload, message} from 'antd';
import Link from 'next/link';
import {CalendarOutlined, MailOutlined, PhoneOutlined, UserOutlined} from '@ant-design/icons';
import {motion} from "framer-motion";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import {lato} from "@/lib/fonts";

const {Title} = Typography;

interface ProfileSidebarProps {
    fullname: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    dob: string | undefined;
    avatarUrl?: string | undefined;
    onAvatarChange?: (file: File) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({fullname, email, phone, dob, avatarUrl, onAvatarChange}) => {
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
            setFileList([info.file]);
            if (onAvatarChange) {
                onAvatarChange(file);
            }
            message.success(`${file.name} uploaded successfully`);
        }
    };

    return (
        <div className="h-full p-6 rounded-xl flex flex-col items-center space-y-6">
            <div className="w-full">
                <MyBreadcrumb paths={[
                    {label: 'Home', href: '/public'},
                    {label: 'My Profile'}
                ]}/>
            </div>

            <motion.h4 initial={{color: "#019376"}}
                       animate={{color: ["#3f51b5", "#019376"]}}
                       transition={{duration: 3, repeat: Infinity}}
                       className="text-lg mt-0 font-semibold"
            >
                My Profile
            </motion.h4>

            <div className="flex flex-col items-center space-y-3">
                <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleUpload}
                    fileList={fileList}
                    className="text-center"
                >
                    <Avatar
                        size={150}
                        src={avatar}
                        icon={<UserOutlined/>}
                        className="cursor-pointer border-4 border-white shadow-lg mx-auto"
                    />
                </Upload>
            </div>

            <div className="text-center space-y-2 w-full max-w-xs">
                <Title level={2} className={`${lato.className} text-black`}>
                    {fullname || 'N/A'}
                </Title>

            </div>

            <div className="w-full text-left max-w-xs flex flex-col items-start space-y-4">
                <div className="flex items-center justify-center space-x-2">
                    <label className="text-black font-medium">
                        <MailOutlined className="mr-2"/>
                        Email:
                    </label>
                    <p className="text-black font-medium"> {email || 'N/A'}</p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                    <label className="text-black font-medium">
                        <CalendarOutlined className="mr-2"/>
                        Date of Birth:
                    </label>
                    <p className="text-black font-medium">{dob || 'N/A'}</p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                    <label className="text-black font-medium">
                        <PhoneOutlined className="mr-2"/>
                        Phone Number:
                    </label>
                    <p className="text-black font-medium">{phone || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;