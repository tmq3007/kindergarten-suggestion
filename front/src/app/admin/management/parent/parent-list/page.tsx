"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Card, Input } from "antd";
import { Pageable, useGetUserListQuery } from "@/redux/services/userApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import ParentList from "@/app/components/parent/ParentList";
import { ParentVO } from "@/redux/services/parentApi";
import { ApiResponse } from "@/redux/services/config/baseQuery";

const { Search } = Input;
const mockData: ApiResponse<{ content: ParentVO[]; pageable: Pageable }> = {
    data: {
        content: [
            {
                username: "john_doe",
                email: "john.doe@example.com",
                status: true,
                fullname: "John Doe",
                phone: "555-0123",
                dob: "1980-05-15",
                district: "Downtown",
                ward: "Ward 1",
                province: "California",
                street: "123 Main St",
                role: "parent",
                media: {
                    url: "https://example.com/avatars/john.jpg",
                    filename: "",
                    cloudId: ""
                }
            },
            {
                username: "jane_smith",
                email: "jane.smith@example.com",
                status: false,
                fullname: "Jane Smith",
                phone: "555-0456",
                dob: "1975-08-22",
                district: null,
                ward: null,
                province: "New York",
                street: "456 Oak Ave",
                role: "parent",
                media: undefined // No avatar
            },
            {
                email: "mary.johnson@example.com",
                status: true,
                fullname: "Mary Johnson",
                phone: "555-0789",
                dob: "1985-03-10",
                district: "Uptown",
                ward: "Ward 3",
                province: "Texas",
                street: null,
                role: "parent",
                media: {
                    url: "https://example.com/avatars/mary.jpg",
                    filename: "",
                    cloudId: ""
                }
            },
            {
                email: "bob.wilson@example.com",
                status: undefined,
                fullname: "Bob Wilson",
                phone: "555-0987",
                dob: "1970-12-01",
                district: null,
                ward: null,
                province: null,
                street: null,
                role: "parent",
                media: undefined
            },
            {
                username: "alice_brown",
                email: "alice.brown@example.com",
                status: true,
                fullname: "Alice Brown",
                phone: "555-0654",
                dob: "1982-07-19",
                district: "Eastside",
                ward: "Ward 2",
                province: "Florida",
                street: "789 Pine Rd",
                role: "parent",
                media: {
                    url: "https://example.com/avatars/alice.jpg",
                    filename: "",
                    cloudId: ""
                }
            }
        ],
        pageable: {
            totalElements: 25, // Total items across all pages
            pageNumber: 1,
            pageSize: 5,
            totalPages: 5
        }
    },
    code: 200,
    message: "Success"
};
export default function Page() {
    const [currentPage, setCurrentPage] = useState(1); // State to manage the current pagination page
    const [currentPageSize, setCurrentPageSize] = useState(15); // State to manage the number of items per page
    const [searchCriteria, setSearchCriteria] = useState({
        email: undefined as string | undefined, // Search criteria for email
        name: undefined as string | undefined, // Search criteria for name
        phone: undefined as string | undefined, // Search criteria for phone number
    });


    const { data, isLoading, error, isFetching } = useGetUserListQuery({
        page: currentPage,
        size: currentPageSize, // Number of items per page
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
                name: undefined,
                phone: undefined,
            });
        } else {
            // Analyze and map the input value to specific search fields
            const lowerValue = value.trim().toLowerCase();
            setSearchCriteria({
                email: lowerValue.includes("@") ? lowerValue : undefined, // Assume email contains '@'
                name: lowerValue && !lowerValue.includes("@") && !/^\d+$/.test(lowerValue) ? lowerValue : undefined, // Assume name is not numeric, not email
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
                    { label: "Parent Management", href: "/admin/management/parent/parent-list" },
                    { label: "Parent List" },
                ]}
            />
            <Card title={
                <>
                    {/* Page header with search bar and add user button */}
                    < div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <SchoolManageTitle title={"Parent List"} />
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
                        fetchPage={(page, size) => console.log(`Fetching page ${page} with size ${size}`)}
                        data={mockData} // User data fetched from API
                        error={null} // Error state for the API query
                        isLoading={false} // Loading state
                        isFetching={false} // Fetching state during API interaction

                    // fetchPage={fetchPage} // Handle pagination
                    // data={mockData} // User data fetched from API
                    // error={error} // Error state for the API query
                    // isLoading={isLoading} // Loading state
                    // isFetching={isFetching} // Fetching state during API interaction
                    />
                </div>
            </Card >
        </>
    );
}