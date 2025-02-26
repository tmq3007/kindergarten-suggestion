import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Pageable, UserVO } from "@/redux/services/types";
import { Table, Tag, Space, Pagination, Popconfirm, Result, Button } from "antd";
import { EditOutlined, DeleteOutlined, ReloadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { Typography } from "antd";
import { useRouter } from "next/navigation";
const { Paragraph, Text } = Typography;

interface UserListProps {
    data: ApiResponse<{ content: UserVO[]; pageable: Pageable }> | undefined;
    isLoading: boolean;
    error: any;
    fetchPage: (page: number) => void;
    isFetching: boolean;
}

//table layout
const columns = [
    { title: "Fullname", dataIndex: "fullname", key: "fullname", width: 120, fixed: true },
    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    { title: "Phone No.", dataIndex: "phone", key: "phone", width: 100 },
    { title: "Address", dataIndex: "address", key: "address", width: 400 },
    { title: "Role", dataIndex: "role", key: "role", width: 100 },
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
                    title="Are you sure you want to delete this user?"
                    okText="Yes"
                    cancelText="No"
                >
                    <a href="#">
                        <DeleteOutlined style={{ fontSize: "18px", color: "red" }} />
                    </a>
                </Popconfirm>
            </Space>
        ),
    },
];


export default function UserList({ fetchPage, data, isLoading, error, isFetching }: UserListProps) {
    const [current, setCurrent] = useState(1);
    const router = useRouter();
    const users = data?.data.content.map((user) => ({ ...user, key: user.id })) || [];
    const totalElements = data?.data.pageable.totalElements || 0;
    const handlePageChange = (page: number) => {
        setCurrent(page);
        fetchPage(page - 1);
    };
    if (error) return (
        <Result
            status={error.status || "500"}
            title={error.status}
            subTitle="Sorry, something went wrong."

            extra={<Button type="primary" icon={<ReloadOutlined />} onClick={() => router.refresh()}>Reload</Button>}
        >
            <div className="desc">
                <Paragraph>
                    <Text
                        strong
                        style={{
                            fontSize: 16,
                        }}
                    >
                        The content you submitted has the following error:
                    </Text>
                </Paragraph>
                <Paragraph>
                    <CloseCircleOutlined className="site-result-demo-error-icon" /> {error?.data?.message ? "Error: " + error.data.message : "Unknown error"}
                </Paragraph>
            </div>
        </Result>
    );


    return (
        <div className="shadow-md sm:rounded-lg p-4">
            <Table className="over-flow-scroll" columns={columns} dataSource={users} pagination={false} loading={isFetching} scroll={{ x: "max-content" }} />
            <div className="flex justify-between items-center px-4 py-3">
                <Pagination current={current} total={totalElements} onChange={handlePageChange} showSizeChanger={false} />
            </div>
        </div>
    );
}

