import { Modal, Avatar } from "antd";
import { ParentVO } from "@/redux/services/parentApi";
import ActionButtons from "@/app/components/parent/ActionButton";

interface ParentDetailsModalProps {
    isOpen: boolean;
    parent: ParentVO | null;
    onClose: () => void;
    onDeleteSuccess: (id: number) => void;
    isEnrollPage?: boolean;
    isAdminPage?: boolean

}

export const ParentDetailsModal = ({
                                       isOpen,
                                       parent,
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
                <h4 className="text-xl font-semibold text-blue-700 m-0">
                    {parent?.fullname || "Parent Details"}
                </h4>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            className="p-0"
        >
            {parent && (
                <div className="p-4 flex flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex flex-col items-center gap-2">
                        <Avatar
                            src={parent.media?.url}
                            size={120}
                            className="bg-green-500 border-2 border-gray-100 shadow-sm"
                        >
                            {!parent.media?.url && parent.fullname?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-lg font-bold text-gray-800">{parent.fullname}</span>
                            <span className="text-lg text-gray-500">@{parent.username || "N/A"}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200 my-3" />

                    {/* Details Section */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <span className="text-sm text-gray-500 font-bold block">Email</span>
                            <span className="text-md text-gray-800">{parent.email || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 font-bold block">Phone</span>
                            <span className="text-md text-gray-800">{parent.phone || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 font-bold block">Date of Birth</span>
                            <span className="text-md text-gray-800">{parent.dob || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 font-bold block">Address</span>
                            <span className="text-md text-gray-800">{getFullAddress(parent)}</span>
                        </div>
                        {isEnrollPage ? (
                            <div>
                                <span className="text-sm text-gray-500 font-bold block">Sent At</span>
                                <span className="text-md text-gray-800">
                                    {/* Replace with actual data */}
                                    {parent.pis?.fromDate.toString() || "N/A"}
                                </span>
                            </div>
                        ) : (
                            <div>
                                <span className="text-sm text-gray-500 font-bold block">Enrolled Time</span>
                                <span className="text-md text-gray-800">
                                    {/* Replace with actual data */}
                                    {parent.pis?.fromDate
                                        ? `${parent.pis.fromDate} ~ ${parent.pis.toDate || "NOW"}`
                                        : "N/A"
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions Section */}
                    {parent.pis?.id && (
                        <>
                            <hr className="border-gray-200" />
                            <div className="flex justify-center">
                                <ActionButtons
                                    key={parent.pis.id}
                                    id={parent.pis.id}
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