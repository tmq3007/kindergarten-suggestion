import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Table, Tag, Pagination } from "antd";
import React, { useState, useEffect } from "react";
import { RequestCounsellingVO } from "@/redux/services/requestCounsellingApi";
import { Pageable } from "@/redux/services/userApi";
import { REQUEST_COUNSELLING_STATUS_OPTIONS } from "@/lib/constants";
import ErrorComponent from "../common/ErrorComponent";
import Link from "next/link";

interface ReminderListFormProps {
  data: ApiResponse<{ content: RequestCounsellingVO[]; page: Pageable }> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  fetchPage: (page: number, size: number) => void;
  searchText: string;
}

export default function ReminderListForm({
                                           data,
                                           isLoading,
                                           isFetching,
                                           error,
                                           fetchPage,
                                           searchText,
                                         }: ReminderListFormProps) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const requests = data?.data.content.map((request) => ({ ...request, key: request.id })) || [];
  const totalElements = data?.data.page.totalElements || 0;

  useEffect(() => {
    if (data?.data?.content) {
      const sortedRequests = [...data.data.content].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      // No need to set filteredRequests since we're mapping directly to requests
    }
  }, [data]);

  const handlePageChange = (page: number, size: number) => {
    setPageSize(size);
    setCurrent(page);
    fetchPage(page, size);
  };

  const columns = [
    {
      title:  <div className = "text-center" > Full Name </div>,
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text: string) => text ?? "N/A"
    },
    {
      title: < div className = "text-center" > School Name </div>,
      dataIndex: "schoolName",
      key: "schoolName",
      width: 250,
      render: (text: string) => text ?? "N/A"
    },
    {
      title: < div className = "text-center" > Email </div>,
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (text: string) => text ?? "N/A"
    },
    {
      title: < div className = "text-center" > Phone </div>,
      dataIndex: "phone",
      key: "phone",
      width: 120,
      align: "right" as const,
      render: (text: string) => text ?? "N/A"
    },
    {
      title: < div className = "text-center" > Status </div>,
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: string) => {
        const statusOption = REQUEST_COUNSELLING_STATUS_OPTIONS.find(
            (option) => option.value === String(status)
        );
        const statusText = statusOption ? statusOption.label : "Unknown";
        const colorMap: { [key: string]: string } = {
          Opened: "blue",
          Closed: "green",
          Overdue: "red",
          Unknown: "default",
        };
        return (
            <Tag color={colorMap[statusText] || "default"}>
              {statusText.toUpperCase()}
            </Tag>
        );
      },
    },
    {
      title: < div className = "text-center" > Due Date </div>,
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      align: "center" as const,
      render: (dueDate: string) =>
          new Date(dueDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
    },
    {
      title: < div className = "text-center" > Action </div>,
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: RequestCounsellingVO) => (
          <Link
              href={`/admin/management/request/request-reminder/${record.id}`}
              className="text-blue-500 underline hover:text-blue-700"
          >
            Go to review
          </Link>
      ),
    },
  ];

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
      <div>
        <Table
            className="over-flow-scroll"
            columns={columns}
            locale={{ emptyText: "No results found" }}
            size="small"
            dataSource={requests}
            pagination={false}
            loading={isFetching || isLoading}
            scroll={{
              x: "max-content",
              y: pageSize > 15 ? 600 : undefined,
            }}
        />
        <div className="flex justify-between items-center px-4 py-3">
          <Pagination
              current={current}
              total={totalElements}
              pageSize={pageSize}
              onChange={handlePageChange}
              pageSizeOptions={[10, 30, 50, 100]}
          />
        </div>
      </div>
  );
}