"use client";

import Link from "next/link";
import UserList from "@/app/components/user/UserList";
import React, {useState} from "react";
import {Card} from "antd";
import {useGetUserListQuery} from "@/redux/services/userApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SearchByComponent from "@/app/components/common/SearchByComponent";


// Search options for the SearchByComponent
const searchOptions = [
    {value: "username", label: "Username"},
    {value: "fullname", label: "Fullname"},
    {value: "email", label: "Email"},
    {value: "phone", label: "Phone"},
];


export default function Page() {
    
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(15);
    const [searchCriteria, setSearchCriteria] = useState({
        searchBy: searchOptions[0].value,
        keyword: undefined as string | undefined, // Search term
    });

    const { data, isLoading, isFetching, error } = useGetUserListQuery({
        page: currentPage,
        size: currentPageSize,
        ...searchCriteria,
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
                    {label: "User Management", href: "/admin/management/user/user-list"},
                    {label: "User List"},
                ]}
            />
            <Card
                title={
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <SchoolManageTitle title={"User List"}/>
                        <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                            <div className="w-full md:w-80">
                                <SearchByComponent
                                    onSearch={handleSearch}
                                    options={searchOptions}
                                    initialSearchBy="fullname"
                                />
                            </div>
                            <Link
                                href="create-user"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 text-center"
                            >
                                Add user
                            </Link>
                        </div>
                    </div>
                }
            >
                <div className="mt-4">
                    <UserList
                        fetchPage={fetchPage}
                        data={data}
                        error={error}
                        isLoading={isLoading}
                        isFetching={isFetching}
                    />
                </div>
            </Card>
        </div>
    );
}