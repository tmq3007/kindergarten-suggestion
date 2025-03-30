"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { useGetAllRequestsQuery } from "@/redux/services/requestCounsellingApi";
import RequestListForm from "@/app/components/request_counselling/RequestListForm";
import { Input, notification, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState(""); // Giá trị nhập tạm thời
  const [searchText, setSearchText] = useState(""); // Giá trị gửi lên API
  const router = useRouter();
  const [notificationApi, contextHolder] = notification.useNotification();

  const userIdString = useSelector((state: RootState) => state.user?.id);
  const userId = userIdString ? parseInt(userIdString as string) : null;

  // Gọi API với searchText làm tham số 'name'
  const { data, isLoading, isFetching, error } = useGetAllRequestsQuery({
    page: currentPage,
    size: currentPageSize,
    name: searchText || undefined, // Chỉ gửi khi có searchText
  });

  if (!userId) {
    console.warn("No userId found in Redux store, redirecting to login");
    router.push("/login");
    return null;
  }

  const fetchPage = (page: number, size: number) => {
    setCurrentPage(page);
    setCurrentPageSize(size);
  };

  const handleSearch = () => {
    setSearchText(searchInput); // Gán giá trị từ input vào searchText để gửi lên API
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  return (
      <div className="pt-2">
        {contextHolder}
        <MyBreadcrumb
            paths={[
              { label: "Reminder", href: "/admin/management/request/request-list" },
              { label: "Request List" },
            ]}
        />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold">Request List</div>
              <div className="flex items-center gap-2">
                <Input
                    placeholder="Search by full name"
                    prefix={<SearchOutlined />}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ maxWidth: "300px", width: "100%" }}
                    onPressEnter={handleSearch} // Hỗ trợ nhấn Enter để tìm kiếm
                />
                <Button type="primary" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
            <RequestListForm
                data={data}
                isLoading={isLoading}
                isFetching={isFetching}
                error={error}
                fetchPage={fetchPage}
                searchText={searchText}
            />
          </div>
        </div>
      </div>
  );
}