import {Button, Dropdown, MenuProps, Modal, Space} from "antd";
import {DownOutlined, UserOutlined} from "@ant-design/icons";
import React, {useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {resetUser} from "@/redux/features/userSlice"; // Import action updateUsername
import {useRouter} from "next/navigation";
import {useLogoutMutation} from "@/redux/services/authApi"; // Import action updateUsername


// Định nghĩa kiểu cho props
interface UserDropdownProps {
    username: string;
}

export default function UserDropdown({username}: UserDropdownProps) {
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
            setIsModalVisible(false);

            const result = await logout(undefined).unwrap();

            if (result?.code === 200 && !processed.current) {
                processed.current = true;
                await fetch('/api/logout', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }

            dispatch(resetUser());
            router.push("/public");
        } catch (error) {
            console.log("Logout failed:", error);
        }
    }
    // Xử lý khi người dùng nhấn "Yes" trong Modal
    const handleOk = () => {
        dispatch(resetUser()); // Reset state user trong Redux
        setIsModalVisible(false); // Đóng Modal sau khi logout
    };

    // Xử lý khi người dùng nhấn "No" trong Modal
    const handleCancel = () => {
        setIsModalVisible(false); // Đóng Modal nếu người dùng hủy
    };



    // Định nghĩa các mục trong menu của Dropdown
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
                <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">
                    My Profiles
                </div>
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
        <div ref={modalContainerRef}>
            {/* Dropdown hiển thị tên người dùng */}
            <Dropdown
                className="text-blue-500 z-0"
                menu={menuProps}
                trigger={["click"]} // Chỉ mở Dropdown khi click, tránh hover trên mobile
                open={isDropdownVisible} // Kiểm soát trạng thái hiển thị của Dropdown
                onOpenChange={(open) => setIsDropdownVisible(open)} // Cập nhật trạng thái khi Dropdown thay đổi
            >
                <div onClick={() => setIsDropdownVisible(true)}>
                    <Space>
                        <UserOutlined className="text-black text-sm md:text-2xl" />
                        <span className="text-sm hover:cursor-pointer">{`Welcome! ${username}`}</span>
                        <DownOutlined />
                    </Space>
                </div>
            </Dropdown>

            {/* Modal xác nhận Logout */}
            <Modal
                title="Are you leaving?"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>Cancel</Button>,
                    <Button key="logout" type="primary" danger onClick={handleLogout}>Yes</Button>
                ]}
                className="z-50" // Đảm bảo Modal hiển thị trên các phần tử khác
                getContainer={() => modalContainerRef.current || document.body} // Render Modal vào container hoặc body nếu ref null
            >
                <p>Are you sure you want to logout? All your unsaved data will be lost.</p>
            </Modal>
        </div>
    );
}