"use client";

import { Input, Button, Table, Tag, Space, Breadcrumb, Typography, message } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useGetSchoolListQuery, useGetSchoolListByUserIdQuery } from "@/redux/services/schoolListApi";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";

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
  posted_date: string;
}

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

export default function SchoolList() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  // Lấy role và userId từ Redux store
  const role = useSelector((state: RootState) => state.user?.role);
  const userIdString = useSelector((state: RootState) => state.user?.id);
  const userId = userIdString ? parseInt(userIdString as string) : null;

  // Kiểm tra nếu không có role hoặc userId thì chuyển hướng về login
  if (!role || !userId) {
    console.warn("No role or userId found in Redux store, redirecting to login");
    router.push("/login");
    return null;
  }

  console.log("Role from Redux:", role, "UserId from Redux:", userId);

  // Gọi API phù hợp dựa trên role
  const adminQuery = useGetSchoolListQuery(
      { page, size: pageSize, name: searchText || undefined },
      { skip: role !== "ROLE_ADMIN" }
  );

  const ownerQuery = useGetSchoolListByUserIdQuery(
      { page, size: pageSize, name: searchText || undefined, userId },
      { skip: role !== "ROLE_SCHOOL_OWNER" }
  );

  const { data, isLoading, error } = role === "ROLE_ADMIN" ? adminQuery : ownerQuery;

  // Xử lý lỗi từ API
  useEffect(() => {
    if (error) {
      console.log("API Error:", error);
      if ("status" in error && error.status === 401) {
        message.error("Session expired. Please log in again.");
        router.push("/login");
      } else {
        message.error("Failed to load school list");
      }
    }
  }, [error, router]);

  const schools: SchoolVO[] = data?.data?.content || [];
  const totalElements = data?.data?.pageable?.totalElements || 0;

  const filteredSchools = schools.filter((school) => school.status !== 0);

  const tableData = filteredSchools.map((school) => ({
    key: school.id,
    id: school.id,
    schoolName: school.name,
    address: `${school.street}, ${school.ward}, ${school.district}, ${school.province}`,
    phone: school.phone,
    email: school.email,
    postedDate: school.posted_date ? new Date(school.posted_date).toLocaleDateString() : "N/A",
    status: getStatusText(school.status),
  }));

  const columns = [
    { title: "School Name", dataIndex: "schoolName", key: "schoolName", width: 180, fixed: true, align: "center" as const },
    { title: "Address", dataIndex: "address", key: "address", width: 250, align: "center" as const },
    { title: "Phone No.", dataIndex: "phone", key: "phone", width: 110, align: "center" as const },
    { title: "Email", dataIndex: "email", key: "email", width: 180, align: "center" as const },
    { title: "Posted Date", dataIndex: "postedDate", key: "postedDate", width: 100, align: "center" as const },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
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
      title: "Actions",
      key: "action",
      width: 90,
      align: "center" as const,
      render: (_: any, record: { id: number }) => (
          <Space size="middle" className="flex justify-center">
            <Link href={`/admin/management/school/school-detail/${record.id}`}>
              <Button type="link" icon={<EditOutlined />} />
            </Link>
            <Button type="link" icon={<DeleteOutlined />} danger />
          </Space>
      ),
    },
  ];

  const getRowClassName = (_: any, index: number) => {
    return index % 2 === 0 ? "table-row-light" : "table-row-dark";
  };

  return (
      <div className="pt-2 h-screen">
        <MyBreadcrumb
            paths={[
              { label: 'School Management', href: '/admin/management/school/school-list' },
              { label: 'School List' },
            ]}
        />
        <SchoolManageTitle title={'School List'}/>
        <div className={'bg-white p-5 rounded-lg'}>
          <div className="flex justify-between items-center mb-4">
            <Input
                placeholder="Search by school name"
                prefix={<SearchOutlined/>}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{width: 300}}
            />
            <Link href="/admin/management/school/add-school">
              <Button type="primary" icon={<PlusOutlined/>}>
                Add School
              </Button>
            </Link>
          </div>
          <Table
              size={"small"}
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              pagination={{
                current: page,
                pageSize,
                total: totalElements,
                onChange: (newPage) => setPage(newPage),
                position: ["bottomCenter"],
              }}
              locale={{emptyText: error ? "Error loading data" : "No results found"}}
              rowClassName={getRowClassName}
              scroll={{x: 1200, y: 600}}
              className={'h-full'}
          />
        </div>
      </div>
  );
}