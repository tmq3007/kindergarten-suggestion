import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Pageable, UserVO } from "@/redux/services/types";
import { Table, Tag, Space, Pagination } from "antd";
import { useState } from "react";

interface UserListProps {
    data: ApiResponse<{ content: UserVO[]; pageable: Pageable }> | undefined;
    isLoading: boolean;
    error: any;
    fetchPage: (page: number) => void;
    isFetching: boolean;
}

//table layout
const columns = [
    { title: "Fullname", dataIndex: "fullname", key: "fullname" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone No.", dataIndex: "phone", key: "phone" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) => (
            <Tag color={status === "Active" ? "green" : "volcano"}>
                {status.toUpperCase()}
            </Tag>
        ),
    },
    {
        title: "Action",
        key: "action",
        render: (_: any, record: UserVO) => (
            <Space size="middle">
                <a>Edit</a>
                <a>Delete</a>
            </Space>
        ),
    },
];

export default function UserList({ fetchPage, data, isLoading, error,isFetching }: UserListProps) {
    const [current, setCurrent] = useState(1);
    if (error) return <p>Error loading data</p>;

    const users = data?.data.content.map((user) => ({ ...user, key: user.id })) || [];
    const totalElements = data?.data.pageable.totalElements || 0;
    const handlePageChange = (page: number) => {
        setCurrent(page);
        fetchPage(page - 1);
    };
    return (
        <div className="shadow-md sm:rounded-lg p-4">
            <Table className="over-flow-scroll" columns={columns} dataSource={users} pagination={false} loading={isFetching}/>
            <div className="flex justify-between items-center px-4 py-3">
                <Pagination current={current} total={totalElements} onChange={handlePageChange} />
            </div>
        </div>
    );
}
