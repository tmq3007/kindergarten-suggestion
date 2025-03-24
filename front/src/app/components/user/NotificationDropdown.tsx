import React, { useState } from 'react';
import { Dropdown, Badge, Menu, notification, Button } from 'antd';
import { BellFilled } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAlertReminderQuery } from '@/redux/services/requestCounsellingApi';
import Link from 'next/link';

const NotificationDropdown = () => {
    const userRole = useSelector((state: RootState) => state.user?.role);
    const isSchoolOwner = userRole === 'ROLE_SCHOOL_OWNER';
    const userId = useSelector((state: RootState) => state.user?.id);

    const { data, error, isLoading } = useAlertReminderQuery(Number(userId), {
        skip: !isSchoolOwner || !userId,
    });

    const reminderData = data?.data;

    // Normalize notifications to an array
    const notifications = reminderData
        ? Array.isArray(reminderData)
            ? reminderData
            : [reminderData]
        : [];

    const menu = (
        <Menu className="w-[300px] rounded-md shadow-lg">
            {isLoading ? (
                <Menu.Item>
                    <div className="py-2 text-center">Loading...</div>
                </Menu.Item>
            ) : error ? (
                <Menu.Item>
                    <div className="py-2 text-center">Error loading notifications</div>
                </Menu.Item>
            ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                    <Menu.Item key={notification.id || Math.random()}>
                        <div className="py-2">
                            <div className="font-bold">{notification.title || 'Untitled'}</div>
                            <div>{notification.description || 'No description'}</div>
                            <Link className={'text-center flex justify-center text-blue-500'} href={'/public/school-owner'}>Show Details</Link>
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
            <Dropdown overlay={menu} className={'z-0'} trigger={['hover']} placement="bottomRight">
                <div className="cursor-pointer">
                    <Badge
                        count={notifications.length}
                        offset={[2, 2]}
                        size="small"
                        className="mr-3"
                    >
                        <BellFilled className="text-2xl text-white" />
                    </Badge>
                </div>
            </Dropdown>
        </>
    );
};

export default NotificationDropdown;