import { ApiResponse } from "@/redux/services/config/baseQuery";
import { Table, Tag, Pagination, Space, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import React, { useState } from "react";
import ErrorComponent from "../common/ErrorComponent";
import { Pageable } from "@/redux/services/userApi";

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

interface SchoolListFormProps {
  data: ApiResponse<{ content: SchoolVO[]; page: Pageable }> | undefined;
  isLoading: boolean;
  error: any;
  fetchPage: (page: number, size: number) => void;
  isFetching: boolean;
  onDelete: (id: number) => void;
}

export default function SchoolListForm({ fetchPage, data, error, isFetching, onDelete }: SchoolListFormProps) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const schools = data?.data.content.map((school) => ({ ...school, key: school.id })) || [];
  const totalElements = data?.data.page.totalElements || 0;

  const handlePageChange = (page: number, size: number) => {
    setPageSize(size);
    setCurrent(page);
    fetchPage(page, size);
  };
  const CenteredTitle = ({ title }: { title: string }) => (
      <div className="text-center">{title}</div>
  );
  const statusColorMap: { [key: string]: string } = {
    Saved: "gray",
    Submitted: "blue",
    Approved: "gold",
    Rejected: "red",
    Published: "cyan",
    Unpublished: "orange",
    Deleted: "volcano",
    Unknown: "default",
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "Saved";
      case 1: return "Submitted";
      case 2: return "Approved";
      case 3: return "Rejected";
      case 4: return "Published";
      case 5: return "Unpublished";
      case 6: return "Deleted";
      default: return "Unknown";
    }
  };

  const columns = [
    {
      title: <CenteredTitle title="School Name" />,
      dataIndex: "name",
      key: "name",
      width: 200,
      fixed: true,
      render: (text: string, record: SchoolVO) => (
          <Link href={`/admin/management/school/school-detail/${record.id}`}>
            {text}
          </Link>
      )
    },
    {
      title: <CenteredTitle title="Address" />,
      dataIndex: "address",
      key: "address",
      width: 400,
      render: (_: any, record: SchoolVO) => `${record.street}, ${record.ward}, ${record.district}, ${record.province}` // Ghép địa chỉ
    },
    {
      title: <CenteredTitle title="Phone No." />,
      dataIndex: "phone",
      key: "phone",
      width: 120
    },
    {
      title: <CenteredTitle title="Email" />,
      dataIndex: "email",
      key: "email",
      width: 200
    },
    {
      title: <CenteredTitle title="Posted Date" />,
      dataIndex: "postedDate",
      key: "postedDate",
      width: 150,
      align: "center" as const,
      render: (postedDate: string) =>
          postedDate ? new Date(postedDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) : "N/A"

    },
    {
      title: <CenteredTitle title="Status" />,
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: number) => {
        const statusText = getStatusText(status);
        return (
            <Tag color={statusColorMap[statusText] || "default"}>
              {statusText.toUpperCase()}
            </Tag>
        );
      },
    },
    {
      title: <CenteredTitle title="Actions" />,
      key: "action",
      minWidth: 90,
      align: "center" as const,
      render: (_: any, record: SchoolVO) => (
          <Space size="middle" className="flex justify-center">
            <Link href={`/admin/management/school/edit-school/${record.id}`}>
              <Button type="link" icon={<EditOutlined />} />
            </Link>
            <Button
                type="link"
                onClick={() => onDelete(record.id)}
                icon={<DeleteOutlined />}
                danger
            />
          </Space>
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
            dataSource={schools}
            pagination={false}
            loading={isFetching}
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
              pageSizeOptions={[15, 30, 50, 100]}
          />
        </div>
      </div>
  );
}