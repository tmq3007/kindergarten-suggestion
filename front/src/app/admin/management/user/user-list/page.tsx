"use client";

import Link from "next/link";
import UserList from "@/app/components/UserList";
import { useGetUserListQuery } from "@/redux/services/userListApi";
import { useState } from "react";
import { Input } from "antd";

const { Search } = Input;

export default function Page() {
    const [currentPage, setCurrentPage] = useState(1); // State to manage the current pagination page
    const [curentPageSize, setcurentPageSize] = useState(10); // State to manage the number of items per page
    const [searchCriteria, setSearchCriteria] = useState({
        role: undefined as string | undefined, // Search criteria for role
        email: undefined as string | undefined, // Search criteria for email
        name: undefined as string | undefined, // Search criteria for name
        phone: undefined as string | undefined, // Search criteria for phone number
    });

    // Query data based on the current page and search criteria
    const { data, isLoading, error, isFetching } = useGetUserListQuery({
        page: currentPage,
        size: curentPageSize, // Number of items per page
        ...searchCriteria, // Spread the search criteria (role, email, name, phone)
    });

    // Function to fetch data for the specified page
    const fetchPage = (page: number,size:number) => {
        setCurrentPage(page);
        setcurentPageSize(size);
    };

    // Function to handle the search input
    const handleSearch = (value: string) => {
        if (!value.trim()) {
            // If search input is empty, reset all search criteria to fetch all users
            setSearchCriteria({
                role: undefined,
                email: undefined,
                name: undefined,
                phone: undefined,
            });
        } else {
            // Analyze and map the input value to specific search fields
            const lowerValue = value.trim().toLowerCase();
            setSearchCriteria({
                role: normalizeRole(lowerValue) || undefined, // Map search value to a backend-defined role if valid
                email: lowerValue.includes("@") ? lowerValue : undefined, // Assume email contains '@'
                name: lowerValue && !lowerValue.includes("@") && !/^\d+$/.test(lowerValue) && !isRole(lowerValue) ? lowerValue : undefined, // Assume name is not numeric, not email, not a valid role
                phone: /^\d+$/.test(lowerValue) ? lowerValue : undefined, // Assume phone contains only numbers
            });
        }
        setCurrentPage(0); // Reset to the first page on a new search
    };

    // Function to check if the value is a valid role
    const isRole = (value: string): boolean => {
        const roles = ["admin", "parent", "school owner"];
        return roles.some((role) => role === value);
    };

    // Function to normalize the role to the format expected by the backend (e.g., ROLE_ADMIN)
    const normalizeRole = (value: string): string | undefined => {
        switch (value) {
            case "admin":
            case "role_admin":
                return "ROLE_ADMIN";
            case "parent":
            case "role_parent":
                return "ROLE_PARENT";
            case "school owner":
            case "role_school_owner":
                return "ROLE_SCHOOL_OWNER";
            default:
                return undefined; // Return undefined if no matching role is found
        }
    };

    return (
        <>
            <div>
                {/* Breadcrumb navigation */}
                <nav className="text-sm text-gray-500 mb-4">
                    <span className="text-blue-600 cursor-pointer hover:underline">User Management</span> {" > "}
                    <span className="text-gray-700">User List</span>
                </nav>

                {/* Page header with search bar and add user button */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <h2 className="text-2xl font-semibold mb-4 md:mb-0">User List</h2>

                    <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                        <div className="w-full md:w-80 relative">
                            <Search
                                placeholder="Search user (e.g., name, email, phone, or role: admin/parent/school owner)"
                                enterButton="Search"
                                size="large"
                                onSearch={handleSearch} // Trigger search on button click or Enter key
                                loading={isFetching} // Show loading state during data fetch
                                className="w-full"
                                onChange={(e) => {
                                    if (!e.target.value.trim()) {
                                        handleSearch(""); // Reset search criteria on empty input
                                    }
                                }} // Handle input changes
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

                {/* User List component */}
                <div className="mt-4">
                    <UserList
                        fetchPage={fetchPage} // Handle pagination
                        data={data} // User data fetched from API
                        error={error} // Error state for the API query
                        isLoading={isLoading} // Loading state
                        isFetching={isFetching} // Fetching state during API interaction
                    />
                </div>
            </div>
        </>
    );
}