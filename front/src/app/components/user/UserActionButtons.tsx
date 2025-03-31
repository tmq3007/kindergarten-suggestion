// New component: AdminActionButtons.tsx
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Popconfirm, Space } from "antd";
import Link from "antd/lib/typography/Link";
import {MessageInstance} from "antd/lib/message/interface";

interface UserActionButtonsProps {
    id: number | string;
    onStatusToggle?: (userId: number) => void;
    triggerStatus: (id: number) => Promise<any>;
    message: MessageInstance;

}

function UserActionButtons({ id, onStatusToggle ,triggerStatus,message}: UserActionButtonsProps) {

    const handleToggleStatus = async () => {
        try {
            await triggerStatus(Number(id));
            if(onStatusToggle) onStatusToggle(Number(id));
            message.success("User status updated successfully!");
        } catch (error) {
            console.log(error);
            message.error("Failed to update user status!");
        }
    };

    return (
        <Space size="middle" className="flex justify-center">
            <Link href={`/admin/management/user/edit-user?userId=${id}`}>
                <EditOutlined style={{ fontSize: "18px", color: "#1890ff" }} />
            </Link>
            <Popconfirm
                title="Are you sure you want to change this user's status?"
                onConfirm={handleToggleStatus}
                okText="Yes"
                cancelText="No"
            >
                <DeleteOutlined style={{ fontSize: "18px", color: "red" }} />
            </Popconfirm>
        </Space>
    );
}

export default UserActionButtons;