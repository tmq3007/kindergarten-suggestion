import {ApiResponse} from "@/redux/services/config/baseQuery";
import {Table, Tag, Pagination, Avatar} from "antd";
import {useState} from "react";
import {useRouter} from "next/navigation";
import ErrorComponent from "../common/ErrorComponent";
import {Pageable} from "@/redux/services/userApi";
import {MediaVO, ParentVO} from "@/redux/services/parentApi";
import Link from "antd/lib/typography/Link";

interface ParentListProps {
    data: ApiResponse<{ content: ParentVO[]; page: Pageable }> | undefined;
    isLoading: boolean;
    error: any;
    fetchPage: (page: number, size: number) => void;
    isFetching: boolean;
}

export default function ParentList({fetchPage, data, error, isFetching}: ParentListProps) {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const router = useRouter();
    const parents = data?.data.content.map((parent, index) => ({...parent, key: index})) || [];
    const totalElements = data?.data.page.totalElements || 0;

    const handlePageChange = (page: number, size: number) => {
        setPageSize(size);
        setCurrent(page);
        fetchPage(page, size);
    };

    const getFullAddress = (record: ParentVO) => {
        const addressParts = [
            record.street,
            record.ward,
            record.district,
            record.province
        ].filter(part => part);
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
                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <Avatar
                        src={record.media?.url}
                        size={32}
                        style={{backgroundColor: "#87d068"}}
                    >
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
                        <span className="text-sm text-gray-500">  ({record.username})</span>
                    </span>

                    </div>
                </div>
            )
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200
        },
        {
            title: "Phone No.",
            dataIndex: "phone",
            key: "phone",
            width: 100
        },
        {
            title: "Address",
            key: "address",
            width: 400,
            render: (_: any, record: ParentVO) => (
                <span>{getFullAddress(record)}</span>
            )
        },
        {
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
        return (
            <ErrorComponent error={error}/>
        );
    }

    return (
        <div>
            <Table
                className="over-flow-scroll"
                columns={columns}
                locale={{emptyText: "No results found"}}
                size="small"
                dataSource={parents}
                pagination={false}
                loading={isFetching}
                scroll={{
                    x: "max-content",
                    y: pageSize > 15 ? 600 : undefined
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

