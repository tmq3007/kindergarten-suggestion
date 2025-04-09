"use client";

import { Table, Tag, Pagination } from "antd";
import React, { useState } from "react";
import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Pageable } from "@/redux/services/userApi";
import { RequestCounsellingVO } from "@/redux/services/requestCounsellingApi";
import { REQUEST_COUNSELLING_STATUS_OPTIONS } from "@/lib/constants";
import Link from "next/link";
import ErrorComponent from "@/app/components/common/ErrorComponent";

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
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalElements = data?.data.page.totalElements || 0;

  const handlePageChange = (page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
    fetchPage(page, size);
  };

  const requests = [...(data?.data.content || [])].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });

  const tableData = requests.map((request) => {
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
          <Link href={`/admin/management/request/request-counselling-detail/${record.id}`}>
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
      width: 200,
      onCell: (record: { email: string }) => ({
        onClick: () => {
          navigator.clipboard.writeText(record.email);
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
          navigator.clipboard.writeText(record.phone);
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

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
      <div>
        <Table
            className="over-flow-scroll"
            columns={columns}
            dataSource={tableData}
            loading={isLoading || isFetching}
            scroll={{ x: "max-content" }}
            pagination={false}
            locale={{ emptyText: "No results found" }}
            size="small"
        />
        <div className="flex justify-between items-center px-4 py-3">
          <Pagination
              current={current}
              pageSize={pageSize}
              total={totalElements}
              onChange={handlePageChange}
              pageSizeOptions={["15", "20", "50", "100"]}
              showSizeChanger
          />
        </div>
      </div>
  );
}