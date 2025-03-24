"use client";

import { Input, Table, Tag, notification, ConfigProvider, Card } from "antd"; // Thêm Card từ Ant Design
import { SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { useGetAllRequestsQuery, RequestCounsellingVO } from "@/redux/services/requestCounsellingApi";

interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

interface RequestListResponse {
  content: RequestCounsellingVO[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return "Open";
    case 1: return "Closed";
    case 2: return "Expired";
    default: return "Unknown";
  }
};

export default function RequestList() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const role = useSelector((state: RootState) => state.user?.role);
  const userIdString = useSelector((state: RootState) => state.user?.id);
  const userId = userIdString ? parseInt(userIdString as string) : null;

  const [notificationApi, contextHolder] = notification.useNotification();
  const [allRequests, setAllRequests] = useState<RequestCounsellingVO[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestCounsellingVO[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  if (!userId) {
    console.warn("No userId found in Redux store, redirecting to login");
    router.push("/login");
    return null;
  }

  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({ message, description, placement: "topRight" });
  };

  const { data, isLoading, error } = useGetAllRequestsQuery({
    page: page,
    size: pageSize,
    name: searchText || undefined,
  });

  useEffect(() => {
    if (error) {
      console.log("API Error:", error);
      if ("status" in error && error.status === 401) {
        openNotificationWithIcon("error", "Session Expired", "Please log in again.");
        router.push("/login");
      } else {
        openNotificationWithIcon("error", "Error", "Failed to load request list.");
      }
    }
  }, [error, router]);

  useEffect(() => {
    if (!data || !data.data || !data.data.content) {
      console.warn("Invalid or empty API response, resetting state.");
      setAllRequests([]);
      setFilteredRequests([]);
      setTotalElements(0);
      setPage(1);
      return;
    }

    const requests: RequestCounsellingVO[] = data.data.content || [];
    const filtered = requests.filter((request) =>
        request.name ? request.name.toLowerCase().includes(searchText.toLowerCase()) : false
    );
    const sorted = [...filtered].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    setAllRequests(requests);
    setFilteredRequests(sorted);
    setTotalElements(sorted.length);
  }, [data, searchText]);

  const tableData = filteredRequests.map((request) => ({
    key: request.id,
    id: request.id,
    fullName: request.name ?? "N/A",
    schoolName: request.schoolName ?? "N/A",
    email: request.email ?? "N/A",
    phone: request.phone ?? "N/A",
    status: getStatusText(request.status),
    dueDate: new Date(request.dueDate).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  }));

  const columns = [
    { title: <div className="text-center">Full Name</div>, dataIndex: "fullName", key: "fullName", width: 150 },
    { title: <div className="text-center">School Name</div>, dataIndex: "schoolName", key: "schoolName", width: 250 },
    {
      title: <div className="text-center">Email</div>,
      dataIndex: "email",
      key: "email",
      width: 100,
      onCell: (record: { email: string }) => ({
        onClick: () => {
          navigator.clipboard.writeText(record.email).then(() =>
              openNotificationWithIcon("success", "Success", "Email copied to clipboard!")
          ).catch(() =>
              openNotificationWithIcon("error", "Error", "Failed to copy email.")
          );
        },
        style: { cursor: "pointer" },
      }),
    },
    {
      title: <div className="text-center">Phone</div>,
      dataIndex: "phone",
      key: "phone",
      width: 120,
      align: "right" as const,
      onCell: (record: { phone: string }) => ({
        onClick: () => {
          navigator.clipboard.writeText(record.phone).then(() =>
              openNotificationWithIcon("success", "Success", "Phone number copied to clipboard!")
          ).catch(() =>
              openNotificationWithIcon("error", "Error", "Failed to copy phone number.")
          );
        },
        style: { cursor: "pointer" },
      }),
    },
    {
      title: <div className="text-center">Status</div>,
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: string) => {
        const colorMap: { [key: string]: string } = { Open: "blue", Closed: "green", Expired: "red", Unknown: "default" };
        return <Tag color={colorMap[status] || "default"}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: <div className="text-center">Due Date</div>,
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      align: "center" as const,
    },
    {
      title: <div className="text-center">Action</div>,
      dataIndex: "id",
      key: "id",
      width: 120,
      align: "center" as const,
      render: (id: number) => (
          <a href={`http://localhost:3000/admin/management/request/request-reminder/${id}`}>Go to review</a>
      ),
    },
  ];

  const getRowClassName = (_: any, index: number) => {
    return index % 2 === 0 ? "table-row-light" : "table-row-dark";
  };

  return (

      <div className="pt-2">
        {contextHolder}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="max-w-7xl mx-auto">
            <MyBreadcrumb
                paths={[
                  {label: "Request Management", href: "/admin/management/request/request-list"},
                  {label: "Request List"},
                ]}
            />
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold">Request List</div>
              <Input
                  placeholder="Search by full name"
                  prefix={<SearchOutlined/>}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{maxWidth: "300px", width: "100%"}}
              />
            </div>


            <Card bordered={false}  style={{ width: '100%', boxShadow: 'none' }}>
              <ConfigProvider >
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
                      onChange: (newPage) => {
                        console.log("Pagination changed to page:", newPage);
                        setPage(newPage);
                      },
                      position: ["bottomCenter"],
                      responsive: true,
                    }}
                    locale={{emptyText: error ? "Error loading data" : "No results found"}}
                    rowClassName={getRowClassName}
                />
              </ConfigProvider>
            </Card>
          </div>
        </div>
      </div>
  );
}