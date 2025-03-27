"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { useGetAllRequestsQuery } from "@/redux/services/requestCounsellingApi";
import RequestListForm from "@/app/components/request_counselling/RequestListForm";
import {Input, notification} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import ReminderListForm from "@/app/components/reminder/ReminderListForm";

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const router = useRouter();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [searchText, setSearchText] = useState("");

  const userIdString = useSelector((state: RootState) => state.user?.id);
  const userId = userIdString ? parseInt(userIdString as string) : null;


  const { data, isLoading, isFetching, error } = useGetAllRequestsQuery({
    page: currentPage,
    size: currentPageSize,
  });

  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({ message, description, placement: "topRight" });
  };


  console.log("Data", data)
  console.log("Data1", data?.data)

  // Now do the conditional check after all hooks
  if (!userId) {
    console.warn("No userId found in Redux store, redirecting to login");
    router.push("/login");
    return null;
  }

  const fetchPage = (page: number, size: number) => {
    setCurrentPage(page);
    setCurrentPageSize(size);
  };

  return (
      <div className="pt-2">
        {contextHolder}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="max-w-7xl mx-auto">
            <MyBreadcrumb
                paths={[
                  {label: "Reminder", href: "/admin/management/request/request-list"},
                  {label: "Request List"},
                ]}
            />
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold">Request List</div>
              <Input
                  placeholder="Search by full name"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ maxWidth: "300px", width: "100%" }}
              />
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
        <div className="text-2xl font-bold mb-4"></div>
      </div>
  );
}