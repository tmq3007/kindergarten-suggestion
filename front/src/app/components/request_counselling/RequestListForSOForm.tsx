"use client";

import { Table, Tag, notification, ConfigProvider, Card, Segmented, Pagination } from "antd";
import React, { useState, useEffect } from "react";
import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Pageable } from "@/redux/services/userApi";
import { RequestCounsellingVO } from "@/redux/services/requestCounsellingApi";
import { REQUEST_COUNSELLING_STATUS_OPTIONS } from "@/lib/constants";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClockCircleOutlined, FileTextOutlined, HomeOutlined } from "@ant-design/icons";
import useIsMobile from "@/lib/hook/useIsMobile";
import { SegmentedValue } from "antd/es/segmented";
import dayjs from "dayjs";

interface RequestListFormProps {
  data: ApiResponse<{ content: RequestCounsellingVO[]; page: Pageable }> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  fetchPage: (page: number, size: number) => void;
  searchCriteria: { searchBy: string; keyword: string | undefined };
}

export default function RequestListForSOForm({
                                               data,
                                               isLoading,
                                               isFetching,
                                               error,
                                               fetchPage,
                                               searchCriteria,
                                             }: RequestListFormProps) {
  const searchParams = useSearchParams();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("All");
  const isMobile = useIsMobile();

  // Cập nhật activeTab từ query string
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

  // Hàm hiển thị thông báo
  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({ message, description, placement: "topRight" });
  };

  // Xử lý thay đổi phân trang
  const handlePageChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
    fetchPage(page, size);
  };

  // Xử lý thay đổi tab
  const handleTabChange = (value: SegmentedValue) => {
    setActiveTab(value.toString());
  };

  // Lọc dữ liệu dựa trên searchCriteria và activeTab
  const filteredRequests =
      data?.data.content
      ?.filter((request) => {
        const keyword = searchCriteria.keyword?.toLowerCase() || "";
        let matchesSearch = false;

        if (searchCriteria.searchBy === "fullName") {
          matchesSearch = request.name ? request.name.toLowerCase().includes(keyword) : false;
        } else if (searchCriteria.searchBy === "email") {
          matchesSearch = request.email ? request.email.toLowerCase().includes(keyword) : false;
        } else if (searchCriteria.searchBy === "phone") {
          matchesSearch = request.phone ? request.phone.toLowerCase().includes(keyword) : false;
        }

        const status = String(request.status);
        if (activeTab === "All") return matchesSearch;
        if (activeTab === "Open") return matchesSearch && status === "0";
        if (activeTab === "Overdue") return matchesSearch && status === "2";
        return false;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];


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
      postedDate: dayjs(request.dueDate).format("YYYY-MM-DD HH:mm"),
    };
  });

  const CenteredTitle = ({ title }: { title: string }) => (
      <div className="text-center">{title}</div>
  );

  const statusColorMap: { [key: string]: string } = {
    Opened: "blue",
    Closed: "green",
    Overdue: "red",
    Unknown: "default",
  };

  const columns = [
    {
      title: <CenteredTitle title="Full Name" />,
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      render: (fullName: string, record: { id: number }) => (
          <Link href={`/public/school-owner/view-request/request-counselling-detail/${record.id}`}>
            <span className="text-blue-500 hover:underline">{fullName}</span>
          </Link>
      ),
    },
    {
      title: <CenteredTitle title="Email" />,
      dataIndex: "email",
      key: "email",
      width: 200,
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
      title: <CenteredTitle title="Phone" />,
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
      title: <CenteredTitle title="Status" />,
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: string) => (
          <Tag color={statusColorMap[status] || "default"}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: <CenteredTitle title="Posted Date" />,
      dataIndex: "postedDate",
      key: "postedDate",
      width: 250,
      align: "center" as const,
    },
  ];


  const allCount = data?.data.content.length || 0;
  const openCount = data?.data.content.filter((r) => String(r.status) === "0").length || 0;
  const overdueCount = data?.data.content.filter((r) => String(r.status) === "2").length || 0;

  const segmentOptions = [
    {
      label: isMobile ? (
          <HomeOutlined className="text-xl" />
      ) : (
          <span className="font-bold text-lg flex items-center justify-center gap-2">
          <HomeOutlined /> All ({allCount})
        </span>
      ),
      value: "All",
    },
    {
      label: isMobile ? (
          <FileTextOutlined className="text-xl" />
      ) : (
          <span className="font-bold text-lg flex items-center justify-center gap-2">
          <FileTextOutlined /> Open ({openCount})
        </span>
      ),
      value: "Open",
    },
    {
      label: isMobile ? (
          <ClockCircleOutlined className="text-xl" />
      ) : (
          <span className="font-bold text-lg flex items-center justify-center gap-2">
          <ClockCircleOutlined /> Overdue ({overdueCount})
        </span>
      ),
      value: "Overdue",
    },
  ];

  if (error) {
    return <div className="text-red-500 text-center">Error loading data: {error.message || "Unknown error"}</div>;
  }

  return (
      <Card
          bordered={false}
          style={{ width: "100%", height: "100%", margin: 0, padding: 0 }}
          bodyStyle={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {contextHolder}
        <Segmented
            className="p-1"
            options={segmentOptions}
            value={activeTab}
            onChange={handleTabChange}
            block
            style={{ margin: "16px" }}
        />
        <div style={{ flex: 1, overflow: "auto" }}>
          <Table
              className="over-flow-scroll"
              columns={columns}
              locale={{ emptyText: "No results found" }}
              size="small"
              dataSource={tableData}
              pagination={false}
              loading={isLoading || isFetching}
              scroll={{
                x: "max-content",
                y: pageSize > 15 ? 600 : undefined,
              }}
          />
          <div className="flex justify-between items-center px-4 py-3">
            <Pagination
                current={current}
                total={filteredRequests.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        </div>
      </Card>
  );
}