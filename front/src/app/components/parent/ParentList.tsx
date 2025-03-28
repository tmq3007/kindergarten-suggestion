import {ApiResponse} from "@/redux/services/config/baseQuery";
import {Table, Tag, Pagination, Avatar} from "antd";
import {memo, useCallback, useEffect, useMemo, useState} from "react";
import ErrorComponent from "../common/ErrorComponent";
import {Pageable} from "@/redux/services/userApi";
import {ParentVO, useToggleParentStatusMutation} from "@/redux/services/parentApi";
import Link from "antd/lib/typography/Link";
import {setPendingRequestsCount} from "@/redux/features/parentSlice";
import {useDispatch} from "react-redux";
import ActionButtons from "@/app/components/parent/ActionButton";
import {ParentDetailsModal} from "@/app/components/parent/ParentDetailModal";
import useIsMobile from "@/lib/hook/useIsMobile";
import UserActionButtons from "@/app/components/user/UserActionButtons";

interface ParentListProps {
    data: ApiResponse<{ content: ParentVO[]; page: Pageable }> | undefined;
    isLoading: boolean;
    error: any;
    fetchPage: (page: number, size: number) => void;
    isFetching: boolean;
    isEnrollPage?: boolean;
    isAdminPage?: boolean
}

function ParentList({
                        fetchPage,
                        data,
                        error,
                        isFetching,
                        isEnrollPage = false,
                        isAdminPage = false,
                    }: ParentListProps) {
    const dispatch = useDispatch();
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const totalElements = data?.data.page.totalElements || 0;
    const [localData, setLocalData] = useState<ParentVO[]>(() =>
        data?.data.content.map((parent) => ({...parent, key: parent.pis?.id || String(Math.random())})) || []
    );
    const [toggleUserStatus] = useToggleParentStatusMutation();
    const [tableLoading, setTableLoading] = useState(false);
    const [isPagination, setIsPagination] = useState<boolean>(true);
    const isMobile = useIsMobile();
    const tableScroll = useMemo(() => ({
        x: "max-content",
        y: pageSize > 15 ? 600 : undefined,
    }), [pageSize]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState<ParentVO | undefined>(undefined);

    useEffect(() => {
        setLocalData(
            data?.data.content.map((parent) => ({...parent, key: parent.pis?.id || String(Math.random())})) || []
        );
        if (isFetching) {
            setTableLoading(isPagination);
        } else {
            setTableLoading(false);
            setIsPagination(false);
        }
        if (isEnrollPage && isPagination) {
            dispatch(setPendingRequestsCount(totalElements));
        }
    }, [data, isFetching]);

    const handleDeleteSuccess = useCallback((id: number) => {
        setIsPagination(false);
        setTimeout(() => setIsModalOpen(false), 1000);
    }, []);

    const handlePageChange = useCallback((page: number, size: number) => {
        setPageSize(size);
        setCurrent(page);
        setIsPagination(true);
        setTableLoading(true);
        fetchPage(page, size);
    }, [fetchPage]);

    const getFullAddress = (record: ParentVO) => {
        const addressParts = [record.street, record.ward, record.district, record.province].filter((part) => part);
        return addressParts.length > 0 ? addressParts.join(", ") : "N/A";
    };

    const showModal = (parent: ParentVO) => {
        setSelectedParent(parent);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedParent(undefined);
    };
    const columns = [
        {
            title: "Fullname",
            dataIndex: "fullname",
            key: "fullname",
            width: 250,
            fixed: !isMobile,
            render: (fullname: string, record: ParentVO) => (
                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <Avatar src={record.media?.url} size={32} style={{backgroundColor: "#87d068"}}>
                        {!record.media?.url && fullname?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex flex-col gap-1 p-1 rounded ">
                        <span>
                            <Link
                                onClick={() => showModal(record)}
                                className="text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors no-underline hover:underline"
                            >
                                {fullname}
                                <span className="text-sm "> ({record.username})</span>
                            </Link>
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200,
        },
        {
            title: "Phone No.",
            dataIndex: "phone",
            key: "phone",
            width: 100,
        },
        {
            title: "Address",
            key: "address",
            width: 350,
            render: (_: any, record: ParentVO) => <span>{getFullAddress(record)}</span>,
        },
        ...(!isEnrollPage
            ? [
                {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    width: 150,
                    render: (_: any, record: ParentVO) => (
                        <Tag color={record.pis?.status === 1 ? "green" : "default"}>
                            {record.pis?.status === 1 ? "ENROLLED" : "Not Enroll Yet"}
                        </Tag>
                    ),
                },
            ]
            : []),
        ...(isAdminPage
            ? [
                {
                    title: "Account Status",
                    dataIndex: "accountStatus",
                    key: "accountStatus",
                    width: 150,
                    render: (_: any, record: ParentVO) => (
                        <Tag color={record.status ? "green" : "red"}>
                            {record.status ? "ACTIVE" : "DISABLED"}
                        </Tag>
                    ),
                },
            ]
            : []),
        isAdminPage
            ? {
                title: "Action",
                key: "action",
                width: 100,
                render: (_: any, record: ParentVO) => (
                    <UserActionButtons id={record.userId} onStatusToggle={handleDeleteSuccess}
                                       triggerStatus={toggleUserStatus}/>
                ),
            }
            :
            {
                title: "Actions",
                key: "actions",
                width: 150,
                render: (_: any, record: ParentVO) =>
                    record.pis?.id ? (
                        <ActionButtons
                            key={record.pis.id}
                            id={record.pis.id}
                            isEnrollPage={isEnrollPage}
                            onDeleteSuccess={handleDeleteSuccess}
                        />
                    ) : null,
            },
    ]

    if (error) {
        return <ErrorComponent error={error}/>;
    }

    return (
        <div>
            <Table
                className="over-flow-scroll"
                columns={columns}
                locale={{emptyText: "No results found"}}
                size="small"
                dataSource={localData}
                pagination={false}
                loading={tableLoading}
                scroll={tableScroll}
            />
            <div className="flex justify-between items-center px-4 py-3">
                <Pagination
                    current={current}
                    total={totalElements}
                    pageSize={pageSize}
                    responsive={true}
                    showSizeChanger={true}
                    onChange={handlePageChange}
                    pageSizeOptions={[15, 30, 50, 100]}
                />
            </div>
            <ParentDetailsModal
                isOpen={isModalOpen}
                parentInfor={selectedParent}
                isAdminPage={isAdminPage}
                onClose={handleModalClose}
                onDeleteSuccess={handleDeleteSuccess}
                isEnrollPage={isEnrollPage}
            />
        </div>
    );
}

export default memo(ParentList);