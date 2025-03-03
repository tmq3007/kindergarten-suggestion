import { Button, Dropdown, MenuProps, message, Modal, Space } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { resetUser } from "@/redux/features/userSlice";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/services/authApi";
import Link from "next/link";
import { motion } from "framer-motion";

interface UserDropdownProps {
    username: string;
}

export default function UserDropdown({ username }: UserDropdownProps) {
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const processed = useRef(false);

    // Function to open Modal and close Dropdown
    const showModal = () => {
        setIsModalVisible(true);
        setIsDropdownVisible(false);
    };

    // Handle logout process
    const handleLogout = async () => {
        try {
            messageApi.success("Logging out...");
            setIsModalVisible(false);

            const result = await logout(undefined).unwrap();

            if (result?.code == 200 && !processed.current) {
                processed.current = true;
                await fetch("/api/logout", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                dispatch(resetUser());
            }
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(resetUser());
        }
    };

    // Handle cancel action in Modal
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // Define items for the Dropdown menu
    const items: MenuProps["items"] = [
        {
            label: (
                <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                    My Schools
                </div>
            ),
            key: "1",
        },
        { type: "divider" },
        {
            label: (
                <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                    My Requests
                </div>
            ),
            key: "2",
        },
        { type: "divider" },
        {
            label: (
                <Link
                    href={"/public/view-account"}
                    className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300"
                >
                    My Profiles
                </Link>
            ),
            key: "3",
        },
        { type: "divider" },
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

    const menuProps = { items };

    // Define keyframes for smoother gradient animation
    const gradientAnimation = {
        backgroundImage: [
            "linear-gradient(90deg, #00c4cc, #ff007a, #00c4cc)", // Start from left
            "linear-gradient(90deg, #ff007a, #00c4cc, #ff007a)", // Move to right
            "linear-gradient(90deg, #00c4cc, #ff007a, #00c4cc)", // Return to start
        ],
        opacity: [0.8, 1, 0.8], // Subtle blinking effect for smoothness
    };

    return (
        <>
            {contextHolder}
            <div ref={modalContainerRef}>
                <Dropdown
                    className="text-blue-500 z-0"
                    menu={menuProps}
                    trigger={["click"]}
                    open={isDropdownVisible}
                    onOpenChange={(open) => setIsDropdownVisible(open)}
                >
                    <div onClick={() => setIsDropdownVisible(true)}>
                        <Space>
                            <UserOutlined className="text-black text-sm md:text-2xl" />
                            <motion.span
                                className="text-sm md:text-lg hover:cursor-pointer font-bold"
                                style={{
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    color: "transparent",
                                    display: "inline-block", // Ensure gradient isn't clipped
                                }}
                                animate={gradientAnimation} // Apply gradient and blinking animation
                                transition={{
                                    backgroundImage: {
                                        duration: 5, // Increase duration for smoother movement
                                        repeat: Infinity, // Repeat infinitely
                                        ease: "easeInOut", // Smoother motion with easeInOut
                                    },
                                    opacity: {
                                        duration: 0.5, // Faster blink for subtle effect
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                }}
                            >
                                {`Welcome! ${username}`}
                            </motion.span>
                            <DownOutlined />
                        </Space>
                    </div>
                </Dropdown>

                <Modal
                    title="Are you leaving?"
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                            Cancel
                        </Button>,
                        <Button key="logout" type="primary" danger onClick={handleLogout}>
                            Yes
                        </Button>,
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