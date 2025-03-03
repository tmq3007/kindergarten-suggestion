import {ApiResponse} from "@/redux/services/config/baseQuery";
import {Pageable, UserVO} from "@/redux/services/userListApi";
import {message, Pagination, Popconfirm, Space, Table, Tag, Typography} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation";
import ErrorComponent from "./ErrorComponent";
import {useToggleUserStatusMutation} from "@/redux/services/userApi";

interface UserListProps {
    data: ApiResponse<{ content: UserVO[]; pageable: Pageable }> | undefined;
    isLoading: boolean;
    error: any;
    fetchPage: (page: number, size: number) => void;
    isFetching: boolean;
}


export default function UserList({fetchPage, data, error, isFetching}: UserListProps) {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [toggleUserStatus] = useToggleUserStatusMutation();
    const router = useRouter();
    const users = data?.data.content.map((user) => ({...user, key: user.id})) || [];
    const totalElements = data?.data.pageable.totalElements || 0;
    const handlePageChange = (page: number, size: number) => {
        setPageSize(size);
        setCurrent(page);
        fetchPage(page, size);
    };
    const handleToggleStatus = async (userId: number) => {
        try {
            await toggleUserStatus(userId).unwrap();
            message.success("User status updated successfully!");
        } catch (error) {
            message.error("Failed to update user status!");
        }
    };

    //table layout
    const columns = [
        {title: "Fullname", dataIndex: "fullname", key: "fullname", width: 120, fixed: true},
        {title: "Email", dataIndex: "email", key: "email", width: 200},
        {title: "Phone No.", dataIndex: "phone", key: "phone", width: 100},
        {title: "Address", dataIndex: "address", key: "address", width: 400},
        {title: "Role", dataIndex: "role", key: "role", width: 100},
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => (
                <Tag color={status === "Active" ? "green" : "volcano"}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 100,
            render: (_: any, record: UserVO) => (
                <Space size="middle" className="flex justify-center">
                    <Link href={`edit-user?userId=${record.id}`}>
                        <EditOutlined style={{ fontSize: "18px", color: "#1890ff" }} />
                    </Link>
                    <Popconfirm
                        title="Are you sure you want to change this user's status?"
                        onConfirm={() => handleToggleStatus(Number(record.id))}
                        okText="Yes"
                        cancelText="No"
                    >
                        <DeleteOutlined style={{fontSize: "18px", color: "red"}}/>
                    </Popconfirm>
                </Space>
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
        <div className="shadow-md sm:rounded-lg p-4">
            <Table className="over-flow-scroll" columns={columns} locale={{emptyText: "No results found"}}
                   dataSource={users} pagination={false} loading={isFetching} scroll={{x: "max-content", y: 600}}/>
            <div className="flex justify-between items-center px-4 py-3">
                <Pagination current={current} total={totalElements} pageSize={pageSize} onChange={handlePageChange}/>
            </div>
        </div>
    );
}

