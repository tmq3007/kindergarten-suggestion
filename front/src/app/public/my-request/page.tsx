'use client';

import {Suspense, useEffect, useState} from 'react';
import {
    useGetAllRequestCounsellingByParentQuery,
} from "@/redux/services/requestCounsellingApi";
import ParentRequestList from "@/app/components/parent/ParentRequestList";
import {useParams, useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {notification} from "antd";



// Component chính của trang
export default function MyRequestPage() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const router = useRouter();

    const userIdString = useSelector((state: RootState) => state.user?.id);
    const userId = userIdString ? parseInt(userIdString as string) : null;

    const [notificationApi, contextHolder] = notification.useNotification();

    if (!userId) {
        console.warn("No userId found in Redux store, redirecting to login");
        router.push("/login");
        return null;
    }

    const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
        notificationApi[type]({ message, description, placement: "topRight" });
    };

    const {data, isLoading, isFetching, error} = useGetAllRequestCounsellingByParentQuery({page, size: pageSize});

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

    const fetchPage = (newPage: number, newSize: number) => {
        console.log("Fetching page:", newPage, "with size:", newSize);
        setPage(newPage);
    };

    return (
            <ParentRequestList
                data={data}
                isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            fetchPage={fetchPage}/>
    );
}