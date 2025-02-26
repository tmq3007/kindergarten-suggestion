import {Button, Dropdown, MenuProps, message, Modal, Space} from "antd";
import {DownOutlined, UserOutlined} from "@ant-design/icons";
import React, {useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {resetUser} from "@/redux/features/userSlice"; // Import action updateUsername
import {useRouter} from "next/navigation";
import {useLogoutMutation} from "@/redux/services/authApi"; // Import action updateUsername


interface UserDropdownProps {
    username: string;
}

export default function UserDropdown({username}: UserDropdownProps) {
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const processed = useRef(false);

    const handleLogout = async () => {

        try {
            messageApi.success("Logging out...")

            setIsModalOpen(false);

            const result = await logout(undefined).unwrap();

            if (result?.code === 200 && !processed.current) {
                processed.current = true;

                // Perform the fetch and wait for it to complete
                await fetch('/api/logout', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                dispatch(resetUser());

            }
        } catch (error) {
            console.error("Logout failed:", error);
            messageApi.error("Logout failed, back to login").then(() => {
                dispatch(resetUser());
            })
        }
    };




    const items: MenuProps['items'] = [
        {
            label: <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">My
                Schools</div>,
            key: '1',
        },
        {
            type: 'divider',
        },
        {
            label: <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">My
                Requests</div>,
            key: '2',
        },
        {
            type: 'divider',
        },
        {
            label: <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">My
                Profiles</div>,
            key: '3',
        },
        {
            type: 'divider',
        },
        {
            label: <div onClick={() => setIsModalOpen(true)} className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">Logout</div>,
            key: '4',
        },
    ];

    const menuProps = {
        items,
    };

    return (
        <>
            {contextHolder}
            <Dropdown className={'text-blue-500'} menu={menuProps}>
                <div>
                    <Space>
                        <UserOutlined className={'text-black text-2xl'}/>
                        <span className={'text-sm hover:cursor-pointer'}>{`Welcome! ${username}`}</span>
                        <DownOutlined/>
                    </Space>
                </div>
            </Dropdown>

            {/* Modal xác nhận Logout */}
            <Modal
                title="Are you leaving?"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>Cancel</Button>,
                    <Button key="logout" type="primary" danger onClick={handleLogout}>Yes</Button>
                ]}
            >
                <p>Are you sure you want to logout? All your unsaved data will be lost.</p>
            </Modal>
        </>
    );
}
