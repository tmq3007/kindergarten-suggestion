"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import ReminderListForm from "@/app/components/reminder/ReminderListForm"; // Import component mới
import { useGetAllReminderQuery } from "@/redux/services/requestCounsellingApi";
import {Input, notification} from "antd";
import {SearchOutlined} from "@ant-design/icons";

export default function RequestList() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const role = useSelector((state: RootState) => state.user?.role);
  const userIdString = useSelector((state: RootState) => state.user?.id);
  const userId = userIdString ? parseInt(userIdString as string) : null;

  const [notificationApi, contextHolder] = notification.useNotification();

  if (!userId) {
    console.warn("No userId found in Redux store, redirecting to login");
    router.push("/login");
    return null;
  }

  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({ message, description, placement: "topRight" });
  };

  const { data, isLoading, isFetching, error } = useGetAllReminderQuery({
    page: page,
    size: pageSize,
    statuses: [0, 2],
  });

  useEffect(() => {
    if (error) {
      console.log("API Error:", error);
      if ("status" in error && error.status === 401) {
        openNotificationWithIcon("error", "Session Expired", "Please log in again.");
        router.push("/login");
      } else {
        openNotificationWithIcon("error", "Error", "Failed to load request list.");
      }
    }
  }, [error, router]);

  const fetchPage = (newPage: number, newSize: number) => {
    console.log("Fetching page:", newPage, "with size:", newSize);
    setPage(newPage);
  };

  return (
      <div className="pt-2">
        {contextHolder}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="max-w-7xl mx-auto">
            <MyBreadcrumb
                paths={[
                  { label: "Reminder", href: "/admin/management/reminder/request-reminder" },
                  { label: "Request Reminder" },
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
            <ReminderListForm
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