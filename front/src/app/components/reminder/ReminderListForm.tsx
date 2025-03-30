"use client";

import { Table, Tag, notification, ConfigProvider, Card } from "antd";
import React, { useState, useEffect } from "react";
import { ApiResponse } from "@/redux/services/config/baseQuery";
import { RequestCounsellingVO } from "@/redux/services/requestCounsellingApi";
import { Pageable } from "@/redux/services/userApi";
import { REQUEST_COUNSELLING_STATUS_OPTIONS } from "@/lib/constants";

interface ReminderListFormProps {
  data: ApiResponse<{ content: RequestCounsellingVO[]; page: Pageable }> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  fetchPage: (page: number, size: number) => void;
  searchText: string; // Không còn dùng để lọc nữa
}
export default function ReminderListForm({
                                           data,
                                           isLoading,
                                           isFetching,
                                           error,
                                           fetchPage,
                                           searchText, //
                                         }: ReminderListFormProps) {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [filteredRequests, setFilteredRequests] = useState<RequestCounsellingVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize] = useState(10);

  const totalElements = data?.data.page.totalElements || 0;

  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({ message, description, placement: "topRight" });
  };

  useEffect(() => {
    if (!data?.data?.content) {
      setFilteredRequests([]);
      return;
    }

    const requests = [...data.data.content].sort((a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ); // Chỉ sắp xếp, không lọc
    setFilteredRequests(requests);
  }, [data]); // Chỉ phụ thuộc vào data, không cần searchText

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
      dueDate: new Date(request.dueDate).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };
  });

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

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
      <Card bordered={false} style={{ width: "100%", boxShadow: "none", minHeight: "calc(100vh - 300px)" }}>
        {contextHolder}
        <ConfigProvider>
          <Table
              size="small"
              columns={columns}
              dataSource={tableData}
              loading={isLoading || isFetching}
              scroll={{ x: "max-content" }}
              pagination={{
                current,
                pageSize,
                total: totalElements,
                onChange: (newPage, newPageSize) => {
                  setCurrent(newPage);
                  fetchPage(newPage, newPageSize);
                },
                position: ["bottomCenter"],
                responsive: true,
              }}
              locale={{ emptyText: "No results found" }}
              rowClassName={getRowClassName}
              bordered
              style={{
                background: "white",
                borderRadius: "12px"
              }}
          />
        </ConfigProvider>
      </Card>
  );
}