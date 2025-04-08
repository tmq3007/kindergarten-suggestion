"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Card } from "antd";
import { useGetAllReminderQuery } from "@/redux/services/requestCounsellingApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SearchByComponent from "@/app/components/common/SearchByComponent";
import ReminderListForm from "@/app/components/reminder/ReminderListForm";

// Search options for the SearchByComponent
const searchOptions = [
  { value: "name", label: "Fullname" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "schoolName", label: "School Name" },
];

export default function RequestReminderList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchCriteria, setSearchCriteria] = useState({
    searchBy: searchOptions[0].value,
    keyword: undefined as string | undefined,
  });

  const { data, isLoading, isFetching, error } = useGetAllReminderQuery({
    page: currentPage,
    size: currentPageSize,
    statuses: [0, 2],
    searchBy: searchCriteria.searchBy,
    keyword: searchCriteria.keyword,
  });

  const fetchPage = (page: number, size: number) => {
    setCurrentPage(page);
    setCurrentPageSize(size);
  };

  const handleSearch = (criteria: { searchBy: string; keyword: string | undefined }) => {
    setSearchCriteria(criteria);
    setCurrentPage(1);
  };

  return (
      <div>
        <MyBreadcrumb
            paths={[
              { label: "Reminder", href: "/admin/management/reminder/request-reminder" },
              { label: "Request Reminder" },
            ]}
        />
        <Card
            title={
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <SchoolManageTitle title={"Request List"} />
                <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                  <div className="w-full md:w-80">
                    <SearchByComponent
                        onSearch={handleSearch}
                        options={searchOptions}
                        initialSearchBy="name"
                    />
                  </div>
                </div>
              </div>
            }
        >
          <div className="mt-4">
            <ReminderListForm
                fetchPage={fetchPage}
                data={data}
                error={error}
                isLoading={isLoading}
                isFetching={isFetching}
                searchText={searchCriteria.keyword || ""}
            />
          </div>
        </Card>
      </div>
  );
}