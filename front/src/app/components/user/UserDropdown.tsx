import {Button, Dropdown, MenuProps, message, Modal, Space} from "antd";
import {DownOutlined, UserOutlined} from "@ant-design/icons";
import React, {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {resetUser} from "@/redux/features/userSlice";
import {useRouter} from "next/navigation";
import {useLogoutMutation} from "@/redux/services/authApi";
import Link from "next/link";
import {motion} from "framer-motion";
import {RootState} from "@/redux/store";
import {ROLES} from "@/lib/constants";
import {lato} from "@/lib/fonts";

interface UserDropdownProps {
    username: string;
}

export default function UserDropdown({username}: UserDropdownProps) {
    const user = useSelector((state: RootState) => state.user);
    const [messageApi, contextHolder] = message.useMessage();
    const role = useSelector((state: RootState) => state.user?.role);
    const dispatch = useDispatch();
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [isAddSchoolModalVisible, setIsAddSchoolModalVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const processed = useRef(false);

    // Function to open Modal and close Dropdown
    const showLogoutModal = () => {
        setIsLogoutModalVisible(true);
        setIsDropdownVisible(false);
    };

    const showAddSchoolModal = () => {
        setIsAddSchoolModalVisible(true);
        setIsDropdownVisible(false);
    };

    // Handle logout process
    const handleLogout = async () => {
        try {
            messageApi.success("Logging out...");
            setIsLogoutModalVisible(false);

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
    const handleLogoutCancel = () => {
        setIsLogoutModalVisible(false);
    };

    const handleAsSchoolOwner = () => {
        console.log(user)
        if (user.hasSchool) {
            router.push('/public/school-owner');
        } else {
            setIsAddSchoolModalVisible(true);
        }
    }

    const handleAsAdmin = () => {
        router.push('/admin/management/school/school-list');
    }

    const handleAddSchoolCancel = () => {
        setIsAddSchoolModalVisible(false);
    };

    const handleAddSchoolOk = () => {
        router.push('/public/school-owner/add-school')
        setIsAddSchoolModalVisible(false)
    }
    // Define items for the Dropdown menu
    const items: MenuProps["items"] = [
        ...(role === ROLES.PARENT ? [
            {
                label: (
                    <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                        My Requests
                    </div>
                ),
                key: "2",
            },
            {type: "divider" as "divider"},
            {
                label: (
                    <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                        My Schools
                    </div>
                ),
                key: "1",
            },
            {type: "divider" as "divider"},
            {
                label: (
                    <Link
                        href={"/public/view-account"}
                        className="block hover:translate-x-4 hover:!text-blue-500 transition-transform duration-300"
                    >
                        My Profiles
                    </Link>
                ),
                key: "3",
            },
            {type: "divider" as "divider"},
        ] : []),

        ...(role === ROLES.SCHOOL_OWNER ? [
            {
                label: (
                    <div
                        className="hover:translate-x-4 hover:!text-blue-500 transition-transform duration-300"
                        onClick={handleAsSchoolOwner}
                    >
                        As School Owner
                    </div>
                ),
                key: "4",
            },
            {type: "divider" as "divider"},
        ] : []),

        ...(role === ROLES.ADMIN ? [
            {
                label: (
                    <div
                        className="hover:translate-x-4 hover:!text-blue-500 transition-transform duration-300"
                        onClick={handleAsAdmin}
                    >
                        As Admin
                    </div>
                ),
                key: "6",
            },
            {type: "divider" as "divider"},
        ] : []),

        {
            label: (
                <div
                    onClick={showLogoutModal}
                    className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300"
                >
                    Logout
                </div>
            ),
            key: "5",
        },

    ];


    const menuProps = {items};

    // Define keyframes for smoother gradient animation
    const gradientAnimation = {
        backgroundImage: [
            "linear-gradient(90deg, #ffffff, #f0f0f0, #ffffff)",
            "linear-gradient(90deg, #f0f0f0, #ffffff, #f0f0f0)",
            "linear-gradient(90deg, #ffffff, #f0f0f0, #ffffff)",
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
                    trigger={["hover"]}
                    open={isDropdownVisible}
                    onOpenChange={(open) => setIsDropdownVisible(open)}
                >
                    <div onClick={() => setIsDropdownVisible(true)}>
                        <Space>
                            <UserOutlined className="text-white text-sm md:text-2xl"/>
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
                            <DownOutlined
                                className={`text-white transition-transform duration-300 ${
                                    isDropdownVisible ? "rotate-180" : "rotate-0"
                                }`}
                            />
                        </Space>
                    </div>
                </Dropdown>

                <Modal
                    title="Are you leaving?"
                    open={isLogoutModalVisible}
                    onCancel={handleLogoutCancel}
                    footer={[
                        <Button key="cancel" onClick={handleLogoutCancel}>
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

                <Modal title={<div className={`${lato.className} !font-bold text-custom text-2xl`}>You are not managing
                    any school yet</div>}
                       open={isAddSchoolModalVisible}
                       onOk={handleAddSchoolOk}
                       onCancel={handleAddSchoolCancel}
                       getContainer={false}
                >
                    <p className={'pt-5'}> Would you like to add a new school?</p>
                </Modal>
            </div>
        </>
    );
}