
import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Table, Tag, Pagination, Avatar } from "antd";
import { useEffect, useState } from "react";
import ErrorComponent from "../common/ErrorComponent";
import { Pageable } from "@/redux/services/userApi";
import { MediaVO, ParentVO } from "@/redux/services/parentApi";
import Link from "antd/lib/typography/Link";
import { setPendingRequestsCount } from "@/redux/features/parentSlice";
import { useDispatch } from "react-redux";
import {ActionButtons} from "@/app/components/parent/ActionButton";

interface ParentListProps {
    data: ApiResponse<{ content: ParentVO[]; page: Pageable }> | undefined;
    isLoading: boolean;
    error: any;
    fetchPage: (page: number, size: number) => void;
    isFetching: boolean;
    isEnrollPage?: boolean;
}

export default function ParentList({
                                       fetchPage,
                                       data,
                                       error,
                                       isFetching,
                                       isEnrollPage = false,
                                   }: ParentListProps) {
    const dispatch = useDispatch();
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const totalElements = data?.data.page.totalElements || 0;
    const [localData, setLocalData] = useState<ParentVO[]>(() =>
        data?.data.content.map((parent) => ({ ...parent, key: parent.pisId || String(Math.random()) })) || []
    );
    const [tableLoading, setTableLoading] = useState(false); // Custom loading state
    const [isPagination, setIsPagination] = useState<boolean>(false); // Track the last action that triggered a fetch

    useEffect(() => {
        // Update localData when new data arrives
        setLocalData(
            data?.data.content.map((parent) => ({ ...parent, key: parent.pisId || String(Math.random()) })) || []
        );

        // Control tableLoading based on the last fetch action
        if (isFetching) {
            // Show loading only if the fetch was triggered by pagination
            setTableLoading(isPagination);
        } else {
            // Fetch completed, reset loading state
            setTableLoading(false);
            setIsPagination(false);
        }

        if (isEnrollPage && isPagination) {
            dispatch(setPendingRequestsCount(totalElements));
        }
    }, [data, isFetching]);

    const handleDeleteSuccess = (id: number) => {
        setIsPagination(false); // Mark the fetch as delete-triggered
    };

    const handlePageChange = (page: number, size: number) => {
        setPageSize(size);
        setCurrent(page);
        setIsPagination(true); // Mark the fetch as pagination-triggered
        setTableLoading(true); // Show loading during page change
        fetchPage(page, size);
    };

    const getFullAddress = (record: ParentVO) => {
        const addressParts = [record.street, record.ward, record.district, record.province].filter((part) => part);
        return addressParts.length > 0 ? addressParts.join(", ") : "N/A";
    };

    const columns = [
        {
            title: "Fullname",
            dataIndex: "fullname",
            key: "fullname",
            width: 200,
            fixed: window.innerWidth >= 768,
            render: (fullname: string, record: ParentVO) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Avatar src={record.media?.url} size={32} style={{ backgroundColor: "#87d068" }}>
                        {!record.media?.url && fullname?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex flex-col gap-1 p-1 rounded ">
            <span>
              <Link
                  href="#"
                  className="text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors no-underline hover:underline"
              >
                {fullname}
              </Link>
              <span className="text-sm text-gray-500"> ({record.username})</span>
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
            width: 400,
            render: (_: any, record: ParentVO) => <span>{getFullAddress(record)}</span>,
        },
        isEnrollPage
            ? {
                title: "Actions",
                key: "actions",
                width: 150,
                render: (_: any, record: ParentVO) =>
                    record.pisId ? <ActionButtons id={record.pisId} onDeleteSuccess={handleDeleteSuccess} /> : null,
            }
            : {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (userEnrollStatus: boolean | undefined) => (
                    <Tag color={userEnrollStatus ? "green" : "default"}>
                        {userEnrollStatus ? "ENROLLED" : "Not Enroll Yet"}
                    </Tag>
                ),
            },
    ];

    if (error) {
        return <ErrorComponent error={error} />;
    }

    return (
        <div>
            <Table
                className="over-flow-scroll"
                columns={columns}
                locale={{ emptyText: "No results found" }}
                size="small"
                dataSource={localData}
                pagination={false}
                loading={tableLoading} // Use custom loading state
                scroll={{
                    x: "max-content",
                    y: pageSize > 15 ? 600 : undefined,
                }}
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
        </div>
    );
}