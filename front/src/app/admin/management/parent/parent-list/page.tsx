'use client'
// Page.jsx
import { Card } from "antd";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import ParentList from "@/app/components/parent/ParentList";
import { useListAllParentWithFilterQuery } from "@/redux/services/parentApi";
import { useState } from "react";
import SearchByComponent from "@/app/components/common/SearchByComponent";


const searchOptions = [
    { value: "username", label: "Username" },
    { value: "fullname", label: "Fullname" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
];

export default function Page() {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(15);
    const [searchCriteria, setSearchCriteria] = useState({
        searchBy: searchOptions[0].value,
        keyword: undefined as string | undefined,
    });

    const { data, isLoading, isFetching, error } = useListAllParentWithFilterQuery({
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
        <>
            <MyBreadcrumb
                paths={[
                    { label: "Parent Management", href: "/admin/management/parent/parent-list" },
                    { label: "Parent List" },
                ]}
            />
            <Card
                title={
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <SchoolManageTitle title={"Parent List"} />
                        <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                            <div className="w-full">
                                <SearchByComponent
                                    onSearch={handleSearch}
                                    options={searchOptions}
                                    initialSearchBy={searchOptions[0].value}
                                />
                            </div>
                        </div>
                    </div>
                }
            >
                <div className="mt-4">
                    <ParentList
                        fetchPage={fetchPage}
                        data={data}
                        error={error}
                        isLoading={isLoading}
                        isFetching={isFetching}
                    />
                </div>
            </Card>
        </>
    );
}