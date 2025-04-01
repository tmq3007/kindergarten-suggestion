import React from 'react';
import { Tooltip, Badge, Menu } from 'antd';
import { BellFilled, BellOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAlertReminderQuery } from '@/redux/services/requestCounsellingApi';
import Link from 'next/link';
import { useGetReviewReportRemindersQuery } from "@/redux/services/reviewApi";

const NotificationTooltip = () => {
    const userRole = useSelector((state: RootState) => state.user?.role);
    const userId = useSelector((state: RootState) => state.user?.id);

    const isSchoolOwner = userRole === 'ROLE_SCHOOL_OWNER';
    const isAdmin = userRole === 'ROLE_ADMIN';

    // Fetch notifications for School Owner
    const { data, error, isLoading } = useAlertReminderQuery(Number(userId), {
        skip: !isSchoolOwner || !userId,
    });

    const { data: adminData, error: adminError, isLoading: adminLoading } = useGetReviewReportRemindersQuery();

    const reminderData = data?.data || [];
    const schoolOwnerNotifications = Array.isArray(reminderData) ? reminderData : [reminderData];

    const reminderAdminData = adminData?.data || [];
    const adminNotifications = Array.isArray(reminderAdminData) ? reminderAdminData : [reminderAdminData];

    // School Owner Notifications content for Tooltip
    const schoolOwnerTooltipContent = (
        <div className="w-[230px]   bg-white p-2">
            {isLoading ? (
                <div className="py-2 text-center">Loading...</div>
            ) : error ? (
                <div className="py-2 text-center">Error loading notifications</div>
            ) : schoolOwnerNotifications.length > 0 ? (
                schoolOwnerNotifications.map((item) => (
                    <div key={item.title || Math.random()} className="py-2">
                        <div className="font-bold">{item.title || 'Untitled'}</div>
                        <div>{item.description || 'No description'}</div>
                        <Link
                            className="text-center flex justify-center text-blue-500"
                            href="/public/school-owner/view-request?tab=Overdue"
                        >
                            Show Details
                        </Link>
                    </div>
                ))
            ) : (
                <div className="py-2 text-center">No new notifications</div>
            )}
        </div>
    );

    // Admin Notifications content for Tooltip
    const adminTooltipContent = (
        <div className="w-[230px]   bg-white p-2">
            {adminNotifications.length > 0 ? (
                adminNotifications.map((item) => (
                    <div key={item.schoolId} className="py-2 flex justify-between items-center">
                        <div>
                            You have {item.total} pending reports of
                            <span className="font-medium"> {item.schoolName} </span>
                        </div>
                        <Link
                            className="text-blue-400 ml-1.5 font-medium"
                            href={`/admin/management/school/rating-feedback/${item.schoolId}?from=notification`}
                        >
                            Details
                        </Link>
                    </div>
                ))
            ) : (
                <div className="py-2 text-center">No new notifications</div>
            )}
        </div>
    );

    return (
        <Tooltip
            title={isSchoolOwner ? schoolOwnerTooltipContent : isAdmin ? adminTooltipContent : null}
            placement="bottomRight"
            color="white"
            overlayInnerStyle={{ color: '#000' }} // Đặt màu chữ đen cho nội dung tooltip
            className="z-0"
        >
            <div className="cursor-pointer">
                <Badge
                    count={isSchoolOwner ? schoolOwnerNotifications.length : isAdmin ? adminNotifications.length : 0}
                    offset={[2, 2]}
                    size="small"
                    className="mr-3"
                >
                    {isAdmin ? (
                        <BellOutlined className="text-2xl text-black" />
                    ) : (
                        <BellFilled className="text-2xl text-white" />
                    )}
                </Badge>
            </div>
        </Tooltip>
    );
};

export default NotificationTooltip;