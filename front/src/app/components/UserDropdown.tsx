import {Dropdown, MenuProps, Modal, Space} from "antd";
import {DownOutlined, UserOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {updateUsername} from "@/redux/features/userSlice"; // Import action updateUsername

interface UserDropdownProps {
    username: string;
}

export default function UserDropdown({ username }: UserDropdownProps) {
    const dispatch = useDispatch();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        // Nếu người dùng xác nhận, thực hiện logout



        // Thực hiên logic logout

        dispatch(updateUsername(''));
        setIsModalVisible(false); // Đóng modal sau khi logout
    };

    const handleCancel = () => {
        setIsModalVisible(false); // Đóng modal nếu người dùng hủy
    };

    const items: MenuProps['items'] = [
        {
            label: <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">My Schools</div>,
            key: '1',
        },
        {
            type: 'divider',
        },
        {
            label: <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">My Requests</div>,
            key: '2',
        },
        {
            type: 'divider',
        },
        {
            label: <div className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">My Profiles</div>,
            key: '3',
        },
        {
            type: 'divider',
        },
        {
            label: <div onClick={showModal} className="hover:translate-x-4 hover:text-blue-500 transition-transform duration-300">Logout</div>,
            key: '4',
        },
    ];

    const menuProps = {
        items,
    };

    return (
        <>
            <Dropdown className={'text-blue-500'} menu={menuProps}>
                <div>
                    <Space>
                        <UserOutlined className={'text-black text-2xl'} />
                        <span className={'text-sm hover:cursor-pointer'}>{`Welcome! ${username}`}</span>
                        <DownOutlined />
                    </Space>
                </div>
            </Dropdown>

            {/* Modal xác nhận Logout */}
            <Modal
                title="Confirm Logout"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Yes"
                cancelText="No"
                okButtonProps={{
                    danger: true,
                }}
            >
                <p>Are you sure you want to log out?</p>
            </Modal>
        </>
    );
}
