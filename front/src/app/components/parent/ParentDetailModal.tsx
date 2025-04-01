import { Modal, Avatar, Descriptions, Divider, Typography } from "antd";
import { ParentVO } from "@/redux/services/parentApi";
import ActionButtons from "@/app/components/parent/ActionButton";
import { SchoolHistory } from "@/app/components/parent/AcademicHistory";
import { MessageInstance } from "antd/lib/message/interface";

const { Title } = Typography;

interface ParentDetailsModalProps {
    isOpen: boolean;
    parentInfor: ParentVO | undefined;
    onClose: () => void;
    onDeleteSuccess: (id: number) => void;
    isEnrollPage?: boolean;
    isAdminPage?: boolean;
    message: MessageInstance;
}

export const ParentDetailsModal = ({
                                       isOpen,
                                       parentInfor,
                                       onClose,
                                       onDeleteSuccess,
                                       isEnrollPage = false,
                                       isAdminPage = false,
                                       message
                                   }: ParentDetailsModalProps) => {

    const getFullAddress = (record: ParentVO) => {
        const addressParts = [record.street, record.ward, record.district, record.province].filter(Boolean);
        return addressParts.length > 0 ? addressParts.join(", ") : "N/A";
    };

    return (
        <Modal
            title={
                <Title level={4} className="m-0 text-[#1d39c4]">
                    {parentInfor?.fullname || "Parent Details"}
                </Title>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
            centered
            styles={{ body: { padding: "24px" } }}
        >
            {parentInfor && (
                <div className="grid grid-rows-[1fr_auto] h-full gap-6">
                    {/* Main Content Grid */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
                        {/* Basic Information Section */}
                        <div className="flex flex-col gap-6">
                            {/* Header Section */}
                            <div className="flex flex-col items-center gap-2">
                                <Avatar
                                    src={parentInfor.media?.url}
                                    size={100}
                                    className="bg-green-500 border-2 border-gray-100 shadow-sm"
                                >
                                    {!parentInfor.media?.url && parentInfor.fullname?.charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-lg font-bold text-gray-800">{parentInfor.fullname}</span>
                                    <span className="text-lg text-gray-500">@{parentInfor.username || "N/A"}</span>
                                </div>
                            </div>

                            <Divider className="my-0" />

                            {/* Basic Information */}
                            <div>
                                <Title level={5} className="text-gray-600">
                                    Basic Information
                                </Title>
                                <Descriptions column={1} size="small" bordered>
                                    <Descriptions.Item label="Email">
                                        {parentInfor.email || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phone">
                                        {parentInfor.phone || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date of Birth">
                                        {parentInfor.dob || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Address">
                                        {getFullAddress(parentInfor)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <Divider type="vertical" className="h-auto" />

                        {/* Academic History Section */}
                        <div className="flex flex-col">
                            <SchoolHistory parentId={parentInfor.id} />
                        </div>
                    </div>

                    {/* Actions Section */}
                    {!isAdminPage && (
                        <div className="mt-6">
                            <Divider className="mb-4" />
                            <div className="flex justify-end">
                                <ActionButtons
                                    message={message}
                                    key={parentInfor.pis?.id}
                                    id={parentInfor.pis?.id}
                                    isEnrollPage={isEnrollPage}
                                    onDeleteSuccess={onDeleteSuccess}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};