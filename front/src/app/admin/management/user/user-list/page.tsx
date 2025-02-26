"use client";

import Link from "next/link";
import { SearchOutlined } from "@ant-design/icons";
import UserList from "@/app/components/UserList";
import { useGetUserListQuery } from "@/redux/services/userListApi";
import { useState } from "react";
import { Input } from "antd";

const { Search } = Input;

export default function Page() {
    const [currentPage, setCurrentPage] = useState(0);
    const [searchCriteria, setSearchCriteria] = useState({
        role: undefined as string | undefined,
        email: undefined as string | undefined,
        name: undefined as string | undefined,
        phone: undefined as string | undefined,
    });

    const { data, isLoading, error, isFetching } = useGetUserListQuery({
        page: currentPage,
        ...searchCriteria, // Spread the search criteria (role, email, name, phone)
    });

    const fetchPage = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (value: string) => {
        if (!value.trim()) {
            // Nếu không có nội dung tìm kiếm, reset tất cả tiêu chí để hiển thị tất cả người dùng
            setSearchCriteria({
                role: undefined,
                email: undefined,
                name: undefined,
                phone: undefined,
            });
        } else {
            // Phân tích và gán giá trị tìm kiếm cho các trường phù hợp
            const lowerValue = value.trim().toLowerCase();
            setSearchCriteria({
                role: normalizeRole(lowerValue) || undefined, // Xử lý vai trò một cách chi tiết
                email: lowerValue.includes("@") ? lowerValue : undefined, // Giả định email chứa @
                name: lowerValue && !lowerValue.includes("@") && !/^\d+$/.test(lowerValue) && !isRole(lowerValue) ? lowerValue : undefined, // Giả định tên không phải số, không phải email, không phải vai trò
                phone: /^\d+$/.test(lowerValue) ? lowerValue : undefined, // Giả định số điện thoại chỉ chứa số
            });
        }
        setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm mới
    };

    // Hàm kiểm tra xem giá trị có phải là vai trò hợp lệ không
    const isRole = (value: string): boolean => {
        const roles = ["admin", "parent", "school owner"];
        return roles.some((role) => role === value);
    };

    // Hàm chuẩn hóa vai trò thành định dạng backend yêu cầu (ROLE_ADMIN, ROLE_PARENT, ROLE_SCHOOL_OWNER)
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
                return undefined;
        }
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
                    <h2 className="text-2xl font-semibold mb-4 md:mb-0">User List</h2>

                    <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                        <div className="w-full md:w-80 relative">
                            <Search
                                placeholder="Search user (e.g., name, email, phone, or role: admin/parent/school owner)"
                                enterButton="Search"
                                size="large"
                                onSearch={handleSearch} // Kích hoạt tìm kiếm khi nhấn nút hoặc Enter
                                loading={isFetching} // Hiển thị trạng thái loading trong quá trình fetch
                                className="w-full"
                                onChange={(e) => {
                                    if (!e.target.value.trim()) {
                                        handleSearch(""); // Gọi handleSearch với chuỗi rỗng để reset
                                    }
                                }} // Xử lý khi xóa nội dung tìm kiếm
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

                {/* User List */}
                <div className="mt-4">
                    <UserList
                        fetchPage={fetchPage}
                        data={data}
                        error={error}
                        isLoading={isLoading}
                        isFetching={isFetching}
                    />
                </div>
            </div>
        </>
    );
}