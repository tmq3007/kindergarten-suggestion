import {ApiResponse} from "@/redux/services/config/baseQuery";
import {Table, Tag, Pagination} from "antd";
import {useState} from "react";
import ErrorComponent from "../common/ErrorComponent";
import {Pageable, UserVO, useToggleUserStatusMutation} from "@/redux/services/userApi";
import message from "antd/lib/message";
import UserActionButtons from "@/app/components/user/UserActionButtons";
import Link from "next/link";

interface UserListProps {
    data: ApiResponse<{ content: UserVO[]; page: Pageable }> | undefined;
    isLoading: boolean;
    error: any;
    fetchPage: (page: number, size: number) => void;
    isFetching: boolean;
}

export default function UserList({fetchPage, data, error, isFetching}: UserListProps) {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const users = data?.data.content.map((user) => ({...user, key: user.id})) || [];
    const totalElements = data?.data.page.totalElements || 0;
    const [useToggleUserStatus] = useToggleUserStatusMutation();
    const [messageApi, contextHolder] = message.useMessage();

    const handlePageChange = (page: number, size: number) => {
        setPageSize(size);
        setCurrent(page);
        fetchPage(page, size);
    };

    const CenteredTitle = ({ title }: { title: string }) => (
        <div style={{ textAlign: "center", width: "100%" }}>{title}</div>
    );

    //table layout
    const columns = [
        {
            title: <CenteredTitle title="Fullname" />,
            dataIndex: "fullname",
            key: "fullname",
            width: 120,
            fixed: true,
            render: (_: any, record: UserVO) => (
                <Link
                    href={`/admin/management/user/user-detail?userId=${record.id}`}
                    className="text-blue-600 hover:underline"
                >
                    {record.fullname}
                </Link>
            ),
        },
        {title: <CenteredTitle title="Email" />, dataIndex: "email", key: "email", width: 200},
        {title: <CenteredTitle title="Phone No." />, dataIndex: "phone", key: "phone", width: 100},
        {title: <CenteredTitle title="Address" />, dataIndex: "address", key: "address", width: 400},
        {title: <CenteredTitle title="Role" />, dataIndex: "role", key: "role", width: 100},
        {
            title: <CenteredTitle title="Status" />,
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => (
                <div className="flex justify-center">

                    <Tag color={status === "Active" ? "green" : "volcano"}>
                        {status.toUpperCase()}
                    </Tag>
                </div>
            ),
        },
        {
            title: <CenteredTitle title="Action" />,
            key: "action",
            width: 100,
            render: (_: any, record: UserVO) => (
                <UserActionButtons message={messageApi} id={record.id}
                                   triggerStatus={useToggleUserStatus}/>
            ),
        },
    ];
    if (error) {
        return (
            <>
                <ErrorComponent error={error}/>
            </>
        );
    }
    return (
        <div>
            <Table className="over-flow-scroll" columns={columns} locale={{emptyText: "No results found"}} size="small"
                   dataSource={users} pagination={false} loading={isFetching} scroll={{
                x: "max-content",
                y: pageSize > 15 ? 600 : undefined// Set height only when needed
            }}/>
            <div className="flex justify-between items-center px-4 py-3">
                <Pagination current={current} total={totalElements} pageSize={pageSize} onChange={handlePageChange}
                            pageSizeOptions={[10, 30, 50, 100]}/>
            </div>
        </div>
    );
}

