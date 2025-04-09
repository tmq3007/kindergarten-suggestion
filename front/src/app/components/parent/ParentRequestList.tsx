// File: app/components/parent/ParentRequestList.tsx

'use client';
import {Col, Empty, Pagination, Row} from 'antd';
import React, {useEffect, useState} from 'react';
import MyBreadcrumb from '@/app/components/common/MyBreadcrumb';
import {ApiResponse} from '@/redux/services/config/baseQuery';
import {ParentRequestListVO} from '@/redux/services/requestCounsellingApi';
import {Pageable} from '@/redux/services/userApi';
import ParentRequestInfo from "@/app/components/parent/ParentRequestInfo";
import ParentRequestListSkeleton from "@/app/components/skeleton/ParentRequestListSkeleton";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";

interface ParentRequestListFormProps {
    data: ApiResponse<{ content: ParentRequestListVO[]; page: Pageable }> | undefined;
    isLoading: boolean;
    isFetching: boolean;
    error: any;
    fetchPage: (page: number, size: number) => void;
    totalOpenRequest: ApiResponse<{ content: number }> | undefined;
}

export default function ParentRequestList({
                                              data,
                                              isLoading,
                                              isFetching,
                                              error,
                                              fetchPage,
                                              totalOpenRequest
                                          }: ParentRequestListFormProps) {
    const [filteredRequests, setFilteredRequests] = useState<ParentRequestListVO[]>([]);
    const [totalOpenReq, setTotalOpenReq] = useState<number>(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(3);

    const totalElements = data?.data?.page.totalElements || 0;

    // Sắp xếp dữ liệu theo dueDate khi data thay đổi
    useEffect(() => {
        if (!data?.data?.content) {
            setFilteredRequests([]);
            return;
        }

        const requests = [...data.data.content].sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        setFilteredRequests(requests);
    }, [data]);

    console.log(totalOpenRequest);

    useEffect(() => {
        if (totalOpenRequest) {
            // @ts-ignore
            setTotalOpenReq(totalOpenRequest.data);
        }
    }, [totalOpenRequest]);

    // Xử lý lỗi nếu có
    useEffect(() => {
        if (error) {
            console.error('Error fetching requests:', error);
        }
    }, [error]);

    // Xử lý thay đổi trang và kích thước trang
    const handlePageChange = (page: number, size: number) => {
        setCurrent(page);
        setPageSize(size);
        fetchPage(page, size); // API bắt đầu từ page 0
    };

    return (
        <div className="min-h-screen pt-24 px-3 md:px-10">
            <MyBreadcrumb
                paths={[
                    {label: 'My Requests'},
                ]}
            />

            <SchoolManageTitle title={'My Requests'}/>

            {(isLoading || isFetching) ? (
                <>
                <ParentRequestListSkeleton/>
                <ParentRequestListSkeleton/>
                </>
            ) : (
                <>
                    {(totalOpenReq > 0) && (
                        <p className="text-start text-lg mt-5">
                            You have {totalOpenReq} open requests
                        </p>
                    )}

                    {filteredRequests.length ? (
                        <>
                            {filteredRequests.map((request) => (
                                <div key={request.id} className="w-full mb-4 transition-shadow">
                                    <ParentRequestInfo request={request}/>
                                </div>
                            ))}

                            <div className="mt-6 text-center">
                                <Pagination
                                    current={current}
                                    pageSize={pageSize}
                                    total={totalElements}
                                    onChange={handlePageChange}
                                    align="center"
                                    className="mb-5"
                                />
                            </div>
                        </>
                    ) : (
                        <Empty className="mt-10" description="No requests found"/>
                    )}
                </>
            )}

        </div>
    );
}