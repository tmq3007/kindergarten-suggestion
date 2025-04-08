'use client';

import React, {Suspense, useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {Empty, notification, Pagination} from "antd";
import {ParentInSchoolDetailVO, useGetPresentAcademicHistoryByParentQuery} from "@/redux/services/parentApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import ParentSchoolInfo from "@/app/components/parent/ParentSchoolInfo";



// Component chính của trang
export default function CurrentSchoolsSection() {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const router = useRouter();

    const userIdString = useSelector((state: RootState) => state.user?.id);
    const userId = userIdString ? parseInt(userIdString as string) : null;

    const [notificationApi, contextHolder] = notification.useNotification();
    const [schoolData, setSchoolData] = useState<ParentInSchoolDetailVO[]>([]);

    if (!userId) {
        console.warn("No userId found in Redux store, redirecting to login");
        router.push("/login");
        return null;
    }

    const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
        notificationApi[type]({ message, description, placement: "topRight" });
    };

    const {data, isLoading, isFetching, error} = useGetPresentAcademicHistoryByParentQuery({page: current, size: pageSize});

    useEffect(() => {
        if (!data?.data?.content) {
            setSchoolData([]);
            return;
        }

        const schools = [...data.data.content].sort(
            (a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
        );
        setSchoolData(schools);
    }, [data]);

    useEffect(() => {
        if (error) {
            console.log("API Error:", error);
            if ("status" in error && error.status === 401) {
                openNotificationWithIcon("error", "Session Expired", "Please log in again.");
                router.push("/login");
            } else {
                openNotificationWithIcon("error", "Error", "Failed to load request list.");
            }
        }
    }, [error, router]);

    const totalElements = data?.data?.page.totalElements || 0;

    const handlePageChange = (page: number, size: number) => {
        setCurrent(page-1);
        setPageSize(size);
    };

    return (
        <>
            {contextHolder}
            <div className="">

                {totalElements > 0 && (
                    <p className="text-center">
                        You have {totalElements} open requests
                    </p>
                )}

                {(isLoading || isFetching) ? (
                    <div>Skeleton</div>
                ) : (
                    <>
                        {schoolData.length ? (
                            <>
                                {schoolData.map((pis) => (
                                    <div key={pis.id} className="w-full mb-4 transition-shadow">
                                        <ParentSchoolInfo pis={pis} />
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
                            <Empty className="mt-10" description="No requests found" />
                        )}
                    </>
                )}

            </div>
        </>
    );
}