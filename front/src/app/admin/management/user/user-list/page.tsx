"use client"

import Link from "next/link";
import { SearchOutlined } from "@ant-design/icons";
import UserList from "@/app/components/UserList";
import { useGetUserListQuery } from "@/redux/services/userListApi";
import { useState } from "react";
import { Input } from 'antd';

const { Search } = Input;
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
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    {/* Tiêu đề */}
                    <h2 className="text-2xl font-semibold mb-4 md:mb-0">User List</h2>

                    <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                        {/* Thanh tìm kiếm */}
                        <div className="w-full md:w-80 relative">
                            <Search
                                placeholder="Search user"
                                enterButton="Search"
                                size="large"
                                loading
                                className="w-full"
                            />
                        </div>

                        {/* Nút thêm người dùng */}
                        <Link
                            href="create-user"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 text-center"
                        >
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