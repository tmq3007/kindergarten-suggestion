
import { Table, Tag, notification, ConfigProvider, Card, Tabs } from "antd";
import React, { useState, useEffect } from "react";
import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Pageable } from "@/redux/services/userApi";
import { RequestCounsellingVO } from "@/redux/services/requestCounsellingApi";
import { REQUEST_COUNSELLING_STATUS_OPTIONS } from "@/lib/constants";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface RequestListFormProps {
  data: ApiResponse<{ content: RequestCounsellingVO[]; page: Pageable }> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  fetchPage: (page: number, size: number) => void;
  searchText: string;
}

export default function RequestListForm({
                                          data,
                                          isLoading,
                                          isFetching,
                                          error,
                                          fetchPage,
                                          searchText,
                                        }: RequestListFormProps) {
  const searchParams = useSearchParams();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("All");


  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      const validTabs = ["All", "Open", "Overdue"];
      const normalizedTab = tab.trim();
      if (validTabs.includes(normalizedTab)) {
        setActiveTab(normalizedTab);
      }
    }
  }, [searchParams]);

  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({ message, description, placement: "topRight" });
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
    fetchPage(page, size);
  };

  // Lọc dữ liệu dựa trên searchText và activeTab
  const filteredRequests = data?.data.content
  ?.filter((request) => {
    const matchesSearch = request.name
        ? request.name.toLowerCase().includes(searchText.toLowerCase())
        : false;

    const status = String(request.status);
    if (activeTab === "All") {
      return matchesSearch;
    } else if (activeTab === "Open") {
      return matchesSearch && status === "0";
    } else if (activeTab === "Overdue") {
      return matchesSearch && status === "2";
    }
    return false;
  })
  .sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  }) || [];

  const tableData = filteredRequests.map((request) => {
    const statusOption = REQUEST_COUNSELLING_STATUS_OPTIONS.find(
        (option) => option.value === String(request.status)
    );
    return {
      key: request.id,
      id: request.id,
      fullName: request.name ?? "N/A",
      schoolName: request.schoolName ?? "N/A",
      email: request.email ?? "N/A",
      phone: request.phone ?? "N/A",
      status: statusOption ? statusOption.label : "Unknown",
    };
  });

  const columns = [
    {
      title: <div className="text-center">Full Name</div>,
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      render: (fullName: string, record: { id: number }) => (
          <Link href={`/admin/management/request/request-detail/${record.id}`}>
            <span className="text-blue-500 hover:underline">{fullName}</span>
          </Link>
      ),
    },
    {
      title: <div className="text-center">School Name</div>,
      dataIndex: "schoolName",
      key: "schoolName",
      width: 250,
    },
    {
      title: <div className="text-center">Email</div>,
      dataIndex: "email",
      key: "email",
      width: 100,
      onCell: (record: { email: string }) => ({
        onClick: () => {
          navigator.clipboard
          .writeText(record.email)
          .then(() => openNotificationWithIcon("success", "Success", "Email copied to clipboard!"))
          .catch(() => openNotificationWithIcon("error", "Error", "Failed to copy email."));
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
          navigator.clipboard
          .writeText(record.phone)
          .then(() => openNotificationWithIcon("success", "Success", "Phone number copied to clipboard!"))
          .catch(() => openNotificationWithIcon("error", "Error", "Failed to copy phone number."));
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
        const colorMap: { [key: string]: string } = {
          Opened: "blue",
          Closed: "green",
          Overdue: "red",
          Unknown: "default",
        };
        return <Tag color={colorMap[status] || "default"}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  const getRowClassName = (_: any, index: number) => {
    return index % 2 === 0 ? "table-row-light" : "table-row-dark";
  };

  const tabItems = [
    { key: "All", label: "All" },
    { key: "Open", label: "Open" },
    { key: "Overdue", label: "Overdue" },
  ];

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
      <Card bordered={false} style={{ width: "100%", boxShadow: "none", minHeight: "calc(100vh - 300px)" }}>
        {contextHolder}
        <div className="px-6 py-4">
          <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              items={tabItems}
              className="custom-tabs w-full"
          />
          <style jsx global>{`
            .custom-tabs .ant-tabs-nav {
              width: 100%;
              border-bottom: 2px solid #e8e8e8;
            }

            .custom-tabs .ant-tabs-nav-list {
              display: flex;
              width: 100%;
            }

            .custom-tabs .ant-tabs-tab {
              flex: 1;
              margin: 0 !important;
              border: 1px solid #e8e8e8;
              border-bottom: none;
              border-radius: 6px 6px 0 0;
              transition: all 0.3s ease;
            }

            .custom-tabs .ant-tabs-tab:hover {
              background-color: #f5f5f5;
            }

            .custom-tabs .ant-tabs-tab-active {
              background-color: #1890ff;
              border-color: #1890ff;
            }

            .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
              color: white !important;
            }

            .custom-tabs .ant-tabs-tab-btn {
              width: 100%;
              text-align: center;
              font-size: 12px;
              font-weight: 500;
              color: #595959;
            }

            .custom-tabs .ant-tabs-ink-bar {
              background-color: #1890ff;
              height: 2px;
            }

            .custom-tabs .ant-tabs-nav-operations {
              display: none !important;
            }
          `}</style>
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
                loading={isLoading || isFetching}
                scroll={{x: "max-content"}}
                pagination={{
                  current: current,
                  pageSize,
                  total: filteredRequests.length,
                  onChange: handlePageChange,
                  position: ["bottomCenter"],
                  responsive: true,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                }}
                locale={{emptyText: "No results found"}}
                rowClassName={getRowClassName}
                bordered
                style={{
                  background: "white",
                  borderRadius: "12px"
                }}
            />
          </ConfigProvider>
        </div>
      </Card>
  );
}