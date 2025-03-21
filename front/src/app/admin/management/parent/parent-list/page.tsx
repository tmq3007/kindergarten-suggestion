"use client";

import React, {useState} from "react";
import {Card, Input} from "antd";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import ParentList from "@/app/components/parent/ParentList";
import {useListAllParentWithFilterQuery} from "@/redux/services/parentApi";

const {Search} = Input;
export default function Page() {
    const [currentPage, setCurrentPage] = useState(1); // State to manage the current pagination page
    const [currentPageSize, setCurrentPageSize] = useState(15); // State to manage the number of items per page
    const [searchCriteria, setSearchCriteria] = useState({
        email: undefined as string | undefined, // Search criteria for email
        fullname: undefined as string | undefined, // Search criteria for fullname
        username: undefined as string | undefined, // Search criteria for username
        phone: undefined as string | undefined, // Search criteria for phone number
    });


    const {data, isLoading, isFetching, error} = useListAllParentWithFilterQuery({
        page: currentPage,
        size: currentPageSize,
        ...searchCriteria, // Spread the search criteria (email, name, phone)
    });

    // Function to fetch data for the specified page
    const fetchPage = (page: number, size: number) => {
        setCurrentPage(page);
        setCurrentPageSize(size);
    };

    // Function to handle the search input
    const handleSearch = (value: string) => {
        if (!value.trim()) {
            // If search input is empty, reset all search criteria to fetch all users
            setSearchCriteria({
                email: undefined,
                fullname: undefined,
                username: undefined,
                phone: undefined,
            });
        } else {
            // Analyze and map the input value to specific search fields
            const lowerValue = value.trim().toLowerCase();
            setSearchCriteria({
                email: lowerValue.includes("@") ? lowerValue : undefined, // Assume email contains '@'
                fullname: lowerValue && !lowerValue.includes("@") && !/^\d+$/.test(lowerValue) ? lowerValue : undefined, // Assume name is not numeric, not email
                username: lowerValue && !lowerValue.includes("@") && !/^\d+$/.test(lowerValue) ? lowerValue : undefined, // Assume name is not numeric, not email
                phone: /^\d+$/.test(lowerValue) ? lowerValue : undefined, // Assume phone contains only numbers
            });
        }
        setCurrentPage(1); // Reset to the first page on a new search
    };

    return (
        <>
            {/* Breadcrumb navigation */}
            <MyBreadcrumb
                paths={[
                    {label: "Parent Management", href: "/admin/management/parent/parent-list"},
                    {label: "Parent List"},
                ]}
            />
            <Card title={
                <>
                    {/* Page header with search bar and add user button */}
                    < div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <SchoolManageTitle title={"Parent List"}/>
                        <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                            <div className="w-full md:w-80 relative">
                                <Search
                                    placeholder="Search user (e.g., name, email, phone)"
                                    enterButton="Search"
                                    size="large"
                                    onSearch={handleSearch}
                                    loading={isFetching}
                                    className="w-full"
                                    onChange={(e) => {
                                        if (!e.target.value.trim()) {
                                            handleSearch("");
                                        }
                                    }} // Handle input changes
                                />
                            </div>
                        </div>
                    </div>
                </>
            }
            >

                {/* User List component */}
                <div className="mt-4">
                    <ParentList
                        fetchPage={fetchPage} // Handle pagination
                        data={data} // User data fetched from API
                        error={error} // Error state for the API query
                        isLoading={isLoading} // Loading state
                        isFetching={isFetching} // Fetching state during API interaction
                    />
                </div>
            </Card>
        </>
    );
}