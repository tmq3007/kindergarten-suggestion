import {Button, Dropdown, MenuProps, message, Modal, Space} from "antd";
import {DownOutlined, UserOutlined} from "@ant-design/icons";
import React, {useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {resetUser} from "@/redux/features/userSlice"; // Import action updateUsername
import {useRouter} from "next/navigation";
import {useLogoutMutation} from "@/redux/services/authApi";
import Link from "next/link"; // Import action updateUsername


interface UserDropdownProps {
    username: string;
}

export default function UserDropdown({username}: UserDropdownProps) {
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const modalContainerRef = useRef<HTMLDivElement>(null); // Ref cho container của Modal
    const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị Modal
    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Trạng thái hiển thị Dropdown
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const processed = useRef(false);

    // Hàm mở Modal và đóng Dropdown
    const showModal = () => {
        setIsModalVisible(true);
        setIsDropdownVisible(false); // Đóng Dropdown khi Modal mở
    };
    const handleLogout = async () => {

        try {
            messageApi.success("Logging out...")

            setIsModalVisible(false);

            const result = await logout(undefined).unwrap();

            if (result?.code == 200 && !processed.current) {
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
            dispatch(resetUser());
        }
    }
    // Handle when user click "Yes" in Modal
    const handleOk = () => {
        dispatch(resetUser()); // Reset state user in Redux
        setIsModalVisible(false); // Close Modal after logout
    };

    // Handle when user click "No" in Modal
    const handleCancel = () => {
        setIsModalVisible(false); // Close Modal in user cancel
    };


    // Define the items in the Dropdown menu
    const items: MenuProps["items"] = [
        {
            label: (
                <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                    My Schools
                </div>
            ),
            key: "1",
        },
        {
            type: "divider",
        },
        {
            label: (
                <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                    My Requests
                </div>
            ),
            key: "2",
        },
        {
            type: "divider",
        },
        {
            label: (
                <Link href={'/public/view-account'}
                      className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                    My Profiles
                </Link>
            ),
            key: "3",
        },
        {
            type: "divider",
        },
        {
            label: (
                <div
                    onClick={showModal}
                    className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300"
                >
                    Logout
                </div>
            ),
            key: "4",
        },
    ];

    const menuProps = {
        items,
    };

    return (
        <>
            {contextHolder}
            <div ref={modalContainerRef}>
                {/* Dropdown show username */}
                <Dropdown
                    className="text-blue-500 z-0"
                    menu={menuProps}
                    trigger={["click"]}
                    open={isDropdownVisible}
                    onOpenChange={(open) => setIsDropdownVisible(open)}
                >
                    <div onClick={() => setIsDropdownVisible(true)}>
                        <Space>
                            <UserOutlined className="text-black text-sm md:text-2xl"/>
                            <span className="text-sm hover:cursor-pointer">{`Welcome! ${username}`}</span>
                            <DownOutlined/>
                        </Space>
                    </div>
                </Dropdown>

                {/* Modal to confirm Logout */}
                <Modal
                    title="Are you leaving?"
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setIsModalVisible(false)}>Cancel</Button>,
                        <Button key="logout" type="primary" danger onClick={handleLogout}>Yes</Button>
                    ]}
                    className="z-50"
                    getContainer={() => modalContainerRef.current || document.body}
                >
                    <p>Are you sure you want to logout? All your unsaved data will be lost.</p>
                </Modal>
            </div>
        </>
    );
}