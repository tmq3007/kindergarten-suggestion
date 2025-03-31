import React from 'react';
import { Dropdown, Badge, Menu } from 'antd';
import {BellFilled, BellOutlined} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAlertReminderQuery } from '@/redux/services/requestCounsellingApi';
import Link from 'next/link';
import {useGetReviewReportRemindersQuery} from "@/redux/services/reviewApi";

const NotificationDropdown = () => {
    const userRole = useSelector((state: RootState) => state.user?.role);
    const userId = useSelector((state: RootState) => state.user?.id);

    const isSchoolOwner = userRole === 'ROLE_SCHOOL_OWNER';
    const isAdmin = userRole === 'ROLE_ADMIN';

    // Fetch notifications for School Owner
    const { data, error, isLoading } = useAlertReminderQuery(Number(userId), {
        skip: !isSchoolOwner || !userId,
    });

    const { data: adminData, error: adminError, isLoading: adminLoading } = useGetReviewReportRemindersQuery( )


    const reminderData = data?.data || [];
    const schoolOwnerNotifications = Array.isArray(reminderData) ? reminderData : [reminderData];

    const reminderAdminData = adminData?.data || [];
    const adminNotifications = Array.isArray(reminderAdminData) ? reminderAdminData : [reminderAdminData];

    //  School Owner Notifications
    const schoolOwnerMenu = (
        <Menu className="w-[300px] rounded-md shadow-lg">
            {isLoading ? (
                <Menu.Item>
                    <div className="py-2 text-center">Loading...</div>
                </Menu.Item>
            ) : error ? (
                <Menu.Item>
                    <div className="py-2 text-center">Error loading notifications</div>
                </Menu.Item>
            ) : schoolOwnerNotifications.length > 0 ? (
                schoolOwnerNotifications.map((item) => (
                    <Menu.Item key={item.title || Math.random()}>
                        <div className="py-2">
                            <div className="font-bold">{item.title || 'Untitled'}</div>
                            <div>{item.description || 'No description'}</div>
                            <Link
                                className="text-center flex justify-center text-blue-500"
                                href="/public/school-owner/view-request?tab=Overdue"
                            >
                                Show Details
                            </Link>
                        </div>
                    </Menu.Item>
                ))
            ) : (
                <Menu.Item>
                    <div className="py-2 text-center">No new notifications</div>
                </Menu.Item>
            )}
        </Menu>
    );

    // Admin Notifications
    const adminMenu = (
        <Menu className="w-[300px] rounded-md shadow-lg">
            {adminNotifications.length > 0 ? (
                adminNotifications.map((item) => (
                    <Menu.Item key={item.schoolId}>
                        <div className="py-2 flex justify-between items-center">
                            <div>
                                You have {item.total} pending reports of
                                <span className="font-medium"> {item.schoolName} </span>
                            </div>
                            <Link
                                className="text-blue-400 ml-1.5 font-medium"
                                href={`/admin/management/school/rating-feedback/${item.schoolId}?from=notification`} // Add ?from=notification
                            >
                                Details
                            </Link>
                        </div>
                    </Menu.Item>
                ))
            ) : (
                <Menu.Item>
                    <div className="py-2 text-center">No new notifications</div>
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <>
            <Dropdown
                overlay={isSchoolOwner ? schoolOwnerMenu : isAdmin ? adminMenu : <Menu />}
                className="z-0"
                trigger={['hover']}
                placement="bottomRight"
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
            </Dropdown>
        </>
    );
};

export default NotificationDropdown;
