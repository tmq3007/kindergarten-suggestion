"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { useGetRemindersBySchoolOwnerQuery } from "@/redux/services/requestCounsellingApi";
import RequestListForSOForm from "@/app/components/request_counselling/RequestListForSOForm";
import { notification } from "antd";
import { useRouter } from "next/navigation";
import SearchByComponent from "@/app/components/common/SearchByComponent";

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const router = useRouter();
  const [notificationApi, contextHolder] = notification.useNotification();

  // Lấy thông tin user từ Redux store
  const userIdString = useSelector((state: RootState) => state.user?.id);
  const userId = userIdString ? parseInt(userIdString as string) : null;

  // State cho search
  const [searchCriteria, setSearchCriteria] = useState({
    searchBy: "fullName",
    keyword: "" as string | undefined,
  });

  // Kiểm tra userId trước khi gọi API
  if (!userId) {
    console.warn("No userId found in Redux store, redirecting to login");
    router.push("/login");
    return null;
  }

  // Gọi API để lấy danh sách reminders
  const { data, isLoading, isFetching, error } = useGetRemindersBySchoolOwnerQuery({
    page: currentPage,
    size: currentPageSize,
    schoolOwnerId: userId,
  });

  // Hàm xử lý thay đổi phân trang
  const fetchPage = (page: number, size: number) => {
    setCurrentPage(page);
    setCurrentPageSize(size);
  };

  // Hàm hiển thị thông báo
  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({ message, description, placement: "topRight" });
  };

  // Các tùy chọn tìm kiếm
  const searchOptions = [
    { value: "fullName", label: "Full Name" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
  ];

  // Xử lý khi thay đổi tiêu chí tìm kiếm
  const handleSearch = (criteria: { searchBy: string; keyword: string | undefined }) => {
    setSearchCriteria(criteria);
    setCurrentPage(1);
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div className="text-2xl font-bold">Request List</div>
              <div className="w-full sm:w-80">
                <SearchByComponent
                    onSearch={handleSearch}
                    options={searchOptions}
                    initialSearchBy="fullName"
                />
              </div>
            </div>
            <RequestListForSOForm
                data={data}
                isLoading={isLoading}
                isFetching={isFetching}
                error={error}
                fetchPage={fetchPage}
                searchCriteria={searchCriteria}
            />
          </div>
        </div>
      </div>
  );
}