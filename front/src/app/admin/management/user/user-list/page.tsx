"use client"

import Link from "next/link";
import { SearchOutlined } from "@ant-design/icons";
import UserList from "@/app/components/UserList";
import { useGetUserListQuery } from "@/redux/services/userListApi";
import { useState } from "react";

export default function Page() {
    const [currentPage, setCurrentPage] = useState(0);
    const { data, isLoading, error, isFetching } = useGetUserListQuery(currentPage);
    const fetchPage = (page: number) => {
        setCurrentPage(page);
    };
    return (
        <>
            <div>
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-4">
                    <span className="text-blue-600 cursor-pointer hover:underline">User Management</span> {" > "}
                    <span className="text-gray-700">User List</span>
                </nav>

                {/* Form Header */}
                <div className="flex">
                    <div className="w-full items-center flex">
                        <h2 className="text-2xl font-semibold mb-6 ">User List</h2>
                    </div>
                    <div className="w-full justify-end items-end text-end">
                        {/* Search bar */}
                        <form className="w-auto">
                            <div className="relative flex justify-end mb-5">
                                <div className="relative w-6/12">
                                    <input type="search" id="search-dropdown" className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-lg rounded-gray-100 rounded-s-2 border border-s-2  border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" placeholder="Search User" required />
                                    <button type="submit" className="absolute top-0 end-0 p-2.5 h-full text-sm font-medium text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        <SearchOutlined /></button>
                                </div>
                            </div>
                        </form>
                        {/* Add new user btn */}
                        <Link href="create-user" className="inline-block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                            Add user
                        </Link>
                    </div>
                </div>
                {/* User List */}
                <div className="mt-4">
                    <UserList
                        fetchPage={fetchPage}
                        data={data}
                        error={error}
                        isLoading={isLoading}
                        isFetching={isFetching} />
                </div>
            </div>
        </>
    );
}