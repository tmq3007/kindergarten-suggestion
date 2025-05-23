'use client';

import React, { useEffect, useState} from 'react';
import { useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {Empty, notification, Pagination} from "antd";
import {ParentInSchoolDetailVO, useGetPresentAcademicHistoryByParentQuery} from "@/redux/services/parentApi";
import ParentSchoolInfo from "@/app/components/parent/ParentSchoolInfo";
import ParentSchoolListSkeleton from "@/app/components/skeleton/ParentSchoolListSkeleton";
import RatingsPopupWrapper from "@/app/components/review/ReviewPopupWrapper";



// Component chính của trang
export default function CurrentSchoolsSection() {
    const [current, setCurrent] = useState(1);
    const pageSize = 2;
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
        setCurrent(page);
    };

    const [selectedSchool, setSelectedSchool] = useState<{
        schoolId: number;
        schoolName: string;
        isUpdate: boolean;
    } | null>(null);

    const handleOpenModal = (schoolId: number, schoolName: string, isUpdate: boolean) => {
        setSelectedSchool({ schoolId, schoolName, isUpdate });
    };


    const handleCloseModal = () => {
        setSelectedSchool(null);
    };

    return (
        <>
            {contextHolder}
            <div className="">

                {(isLoading || isFetching) ? (
                    <div className='mb-4'>
                        <ParentSchoolListSkeleton/>
                        <ParentSchoolListSkeleton/>
                    </div>
                ) : (
                    <>
                        {schoolData.length ? (
                            <>
                                {schoolData.map((pis,index) => (
                                    <div key={`${pis.id}-${current}-${index}`} className="w-full mb-4 transition-shadow">
                                        <ParentSchoolInfo pis={pis} isCurrent={true} onCloseModalAction={handleCloseModal}
                                                          onOpenModalAction={handleOpenModal}/>
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
                                {selectedSchool && (
                                    <RatingsPopupWrapper
                                        schoolId={selectedSchool.schoolId}
                                        schoolName={selectedSchool.schoolName}
                                        isUpdate={selectedSchool.isUpdate}
                                        isOpen={!!selectedSchool}
                                        onCloseAction={handleCloseModal}
                                    />
                                )}
                            </>
                        ) : (
                            <Empty className="mt-10" description="No schools found" />
                        )}
                    </>
                )}

            </div>

        </>
    );
}