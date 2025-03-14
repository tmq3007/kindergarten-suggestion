"use client";

import {Input, Button, Table, Tag, Space, notification, ConfigProvider} from "antd";
import {SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined} from "@ant-design/icons";
import Link from "next/link";
import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import {useGetSchoolListQuery} from "@/redux/services/schoolApi";

interface SchoolVO {
    id: number;
    status: number;
    name: string;
    schoolType: number;
    district: string;
    ward: string;
    province: string;
    street: string;
    email: string;
    phone: string;
    receivingAge: number;
    educationMethod: number;
    feeFrom: number;
    feeTo: number;
    description: string;
    postedDate: string;
}

//handle status type
const getStatusText = (status: number) => {
    switch (status) {
        case 0:
            return "Saved";
        case 1:
            return "Submitted";
        case 2:
            return "Approved";
        case 3:
            return "Rejected";
        case 4:
            return "Published";
        case 5:
            return "Unpublished";
        case 6:
            return "Deleted";
        default:
            return "Unknown";
    }
};

export default function SchoolList() {
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const router = useRouter();

    const role = useSelector((state: RootState) => state.user?.role);
    const userIdString = useSelector((state: RootState) => state.user?.id);
    const userId = userIdString ? parseInt(userIdString as string) : null;

    const [notificationApi, contextHolder] = notification.useNotification();
    const [allSchools, setAllSchools] = useState<SchoolVO[]>([]);
    const [filteredSchools, setFilteredSchools] = useState<SchoolVO[]>([]);
    const [totalElements, setTotalElements] = useState(0);

    //check login
    if (!userId) {
        console.warn("No userId found in Redux store, redirecting to login");
        router.push("/login");
        return null;
    }

    //show out notification
    const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
        notificationApi[type]({
            message,
            description,
            placement: "topRight",
        });
    };

    //get all school list
    const {data, isLoading, error} = useGetSchoolListQuery({
        page: 1,
        size: 1000,
        name: searchText || undefined,
    });

    useEffect(() => {
        if (error) {
            console.log("API Error:", error);
            if ("status" in error && error.status === 401) {
                openNotificationWithIcon("error", "Session Expired", "Please log in again.");
                router.push("/login");
            } else {
                openNotificationWithIcon("error", "Error", "Failed to load school list.");
            }
        }
    }, [error, router]);

    //filter school list (admin can't view saved school status = 0 & 6)
    useEffect(() => {
        const schools: SchoolVO[] = data?.data?.content || [];
        console.log("Original schools:", schools);
        const filtered = schools.filter((school) => school.status !== 0 && school.status !== 6);

        // Sort by postedDate (newest to oldest)
        const sorted = [...filtered].sort((a, b) => {
            const dateA = a.postedDate ? new Date(a.postedDate) : null;
            const dateB = b.postedDate ? new Date(b.postedDate) : null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB.getTime() - dateA.getTime();
        });
        console.log("Sorted schools:", sorted);

        setAllSchools(schools);
        setFilteredSchools(sorted); // Sử dụng sorted thay vì filtered
        setTotalElements(sorted.length);
    }, [data]);

    const tableData = filteredSchools
    .slice((page - 1) * pageSize, page * pageSize)
    .map((school) => {
        return {
            key: school.id,
            id: school.id,
            schoolName: school.name,
            address: `${school.street}, ${school.ward}, ${school.district}, ${school.province}`,
            phone: school.phone,
            email: school.email,
            postedDate: school.postedDate
                ? new Date(school.postedDate).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                : "N/A",
            status: getStatusText(school.status),
        };
    });

    const columns = [
        {
            title: <div className={'text-center'}>School Name</div>,
            dataIndex: "schoolName",
            key: "schoolName",
            minWidth: 150,
            render: (schoolName: string, record: { id: number }) => (
                <Link href={`/admin/management/school/school-detail/${record.id}`}>
                    <span className="text-blue-500 hover:underline">{schoolName}</span>
                </Link>
            ),
        },
        {
            title: <div className={'text-center'}>Address</div>,
            dataIndex: "address",
            key: "address",
            minWidth: 200,
            onCell: (record: { address: string }) => ({
                onClick: () => {
                    navigator.clipboard
                        .writeText(record.address)
                        .then(() => {
                            openNotificationWithIcon("success", "Success", "Address copied to clipboard!");
                        })
                        .catch(() => {
                            openNotificationWithIcon("error", "Error", "Failed to copy address.");
                        });
                },
                style: {cursor: "pointer"},
            }),
        },
        {
            title: <div className={'text-center'}>Phone No.</div>,
            dataIndex: "phone",
            key: "phone",
            minWidth: 120,
            align: "right" as const,
            onCell: (record: { phone: string }) => ({
                onClick: () => {
                    navigator.clipboard
                        .writeText(record.phone)
                        .then(() => {
                            openNotificationWithIcon("success", "Success", "Phone number copied to clipboard!");
                        })
                        .catch(() => {
                            openNotificationWithIcon("error", "Error", "Failed to copy phone number.");
                        });
                },
                style: {cursor: "pointer"},
            }),
        },
        {
            title: <div className={'text-center'}>Email</div>,
            dataIndex: "email",
            key: "email",
            minWidth: 150,
            onCell: (record: { email: string }) => ({
                onClick: () => {
                    navigator.clipboard
                        .writeText(record.email)
                        .then(() => {
                            openNotificationWithIcon("success", "Success", "Email copied to clipboard!");
                        })
                        .catch(() => {
                            openNotificationWithIcon("error", "Error", "Failed to copy email.");
                        });
                },
                style: {cursor: "pointer"},
            }),
        },
        {
            title: <div className={'text-center'}>Posted Date</div>,
            dataIndex: "postedDate",
            key: "postedDate",
            minWidth: 100,
            align: "center" as const,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            minWidth: 100,
            align: "center" as const,
            render: (status: string) => {
                const colorMap: { [key: string]: string } = {
                    Submitted: "default",
                    Approved: "gold",
                    Rejected: "red",
                    Published: "cyan",
                    Unpublished: "orange",
                    Deleted: "gray",
                    Unknown: "default",
                };
                return <Tag color={colorMap[status] || "default"}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: <div className={'text-center'}>Actions</div>,
            key: "action",
            minWidth: 90,
            align: "center" as const,
            render: (_: any, record: { id: number }) => (
                <Space size="middle" className="flex justify-center">
                    <Link href={`/admin/management/school/edit-school/${record.id}`}>
                        <Button type="link" icon={<EditOutlined/>}/>
                    </Link>
                    <Button type="link" icon={<DeleteOutlined/>} danger/>
                </Space>
            ),
        },
    ];

    const getRowClassName = (_: any, index: number) => {
        return index % 2 === 0 ? "table-row-light" : "table-row-dark";
    };

    return (
        <div className="pt-2">
            {contextHolder}
            <MyBreadcrumb
                paths={[
                    {label: "School Management", href: "/admin/management/school/school-list"},
                    {label: "School List"},
                ]}
            />
            <SchoolManageTitle title={"School List"}/>
            <div className="bg-white px-2 py-5 rounded">
                <div className="flex justify-between items-center mb-4">
                    <Input
                        placeholder="Search by school name"
                        prefix={<SearchOutlined/>}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{maxWidth: "300px", width: "100%"}}
                    />
                    <Link href="/admin/management/school/add-school">
                        <Button type="primary" icon={<PlusOutlined/>}>
                            Add School
                        </Button>
                    </Link>
                </div>
                <ConfigProvider
                    theme={{
                        token: {
                            borderRadiusLG: 0,
                        },
                    }}
                >
                    <Table
                        size="small"
                        columns={columns}
                        dataSource={tableData}
                        loading={isLoading}
                        scroll={{x: "max-content"}}
                        pagination={{
                            current: page,
                            pageSize,
                            total: totalElements,
                            onChange: (newPage) => setPage(newPage),
                            position: ["bottomCenter"],
                            responsive: true,
                        }}
                        locale={{emptyText: error ? "Error loading data" : "No results found"}}
                        rowClassName={getRowClassName}
                    />
                </ConfigProvider>
            </div>
        </div>
    );
}