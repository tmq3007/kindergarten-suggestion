import {Modal, Avatar, Descriptions, Divider, Typography} from "antd";
import {ParentVO} from "@/redux/services/parentApi";
import ActionButtons from "@/app/components/parent/ActionButton";
import {SchoolHistory} from "@/app/components/parent/AcademicHistory";

const {Title} = Typography;

interface ParentDetailsModalProps {
    isOpen: boolean;
    parentInfor: ParentVO | undefined;
    onClose: () => void;
    onDeleteSuccess: (id: number) => void;
    isEnrollPage?: boolean;
    isAdminPage?: boolean;
}

export const ParentDetailsModal = ({
                                       isOpen,
                                       parentInfor,
                                       onClose,
                                       onDeleteSuccess,
                                       isEnrollPage = false,
                                       isAdminPage = false,
                                   }: ParentDetailsModalProps) => {

    const getFullAddress = (record: ParentVO) => {
        const addressParts = [record.street, record.ward, record.district, record.province].filter(Boolean);
        return addressParts.length > 0 ? addressParts.join(", ") : "N/A";
    };

    return (
        <Modal
            title={
                <Title level={4} style={{margin: 0, color: "#1d39c4"}}>
                    {parentInfor?.fullname || "Parent Details"}
                </Title>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            styles={{body: {padding: "24px"}}}
        >
            {parentInfor && (
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

                    <Divider style={{margin: "0"}}/>

                    {/* Information Sections */}
                    <div className="flex flex-col gap-6">
                        {/* Basic Information */}
                        <div>
                            <Title level={5} style={{color: "#595959"}}>
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
                        {/* School History */}
                        <SchoolHistory parentId={parentInfor.id}/>
                    </div>
                    {/* Actions Section */}
                    {!isAdminPage && (
                        <>
                            <Divider style={{margin: "16px 0"}}/>
                            <div className="flex justify-end">
                                <ActionButtons
                                    key={parentInfor.pis?.id}
                                    id={parentInfor.pis?.id}
                                    isEnrollPage={isEnrollPage}
                                    onDeleteSuccess={onDeleteSuccess}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </Modal>
    );
};

// Optional: Add custom CSS for compact Rate stars
const styles = `
    .compact-rate .ant-rate-star {
        margin-right: 2px !important;
    }
`;

// Inject styles into the document (if not using a CSS-in-JS solution)
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);