"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "antd";
import { useGetAllRequestsQuery } from "@/redux/services/requestCounsellingApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SearchByComponent from "@/app/components/common/SearchByComponent";
import RequestListForm from "@/app/components/request_counselling/RequestListForm";

// Search options for the SearchByComponent
const searchOptions = [
  { value: "name", label: "Fullname" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "schoolName", label: "School Name" },
];

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchCriteria, setSearchCriteria] = useState({
    searchBy: searchOptions[0].value,
    keyword: undefined as string | undefined,
  });
  const router = useRouter();

  const userIdString = useSelector((state: RootState) => state.user?.id);
  const userId = userIdString ? parseInt(userIdString as string) : null;

  const { data, isLoading, isFetching, error } = useGetAllRequestsQuery({
    page: currentPage,
    size: currentPageSize,
    searchBy: searchCriteria.searchBy,
    keyword: searchCriteria.keyword,
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

  const handleSearch = (criteria: { searchBy: string; keyword: string | undefined }) => {
    setSearchCriteria(criteria);
    setCurrentPage(1);
  };

  return (
      <div>
        <MyBreadcrumb
            paths={[
              { label: "Reminder", href: "/admin/management/request/request-list" },
              { label: "Request List" },
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
            <RequestListForm
                data={data}
                isLoading={isLoading}
                isFetching={isFetching}
                error={error}
                fetchPage={fetchPage}
                searchText={searchCriteria.keyword || ""}
            />
          </div>
        </Card>
      </div>
  );
}