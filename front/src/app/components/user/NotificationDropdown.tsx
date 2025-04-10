import React, { useEffect } from 'react';
import { Tooltip, Badge } from 'antd';
import { BellFilled, BellOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAlertReminderQuery } from '@/redux/services/requestCounsellingApi';
import Link from 'next/link';
import { useGetReviewReportRemindersQuery } from "@/redux/services/reviewApi";
import { useCountActiveSchoolsWithoutRefIdQuery, useCountAllDraftsQuery } from "@/redux/services/schoolApi";
import { useGetCountEnrollRequestBySchoolQuery } from "@/redux/services/parentApi";

const NotificationTooltip = () => {
    const userRole = useSelector((state: RootState) => state.user?.role);
    const userId = useSelector((state: RootState) => state.user?.id);

    const isSchoolOwner = userRole === 'ROLE_SCHOOL_OWNER';
    const isAdmin = userRole === 'ROLE_ADMIN';

    // Fetch notifications for School Owner with polling
    const { data, error, isLoading } = useAlertReminderQuery(Number(userId), {
        skip: !isSchoolOwner || !userId,
    });

    // Fetch pending enrollment requests for School Owner
    const { data: soPendingRequest, error: soPendingRequestError, isLoading: soPendingRequestLoading } = useGetCountEnrollRequestBySchoolQuery(undefined, {
        skip: !isSchoolOwner
    });

    // Fetch notifications for Admin with polling
    const { data: adminReviewData, error: adminError, isLoading: adminLoading } = useGetReviewReportRemindersQuery(undefined, {
        skip: !isAdmin
    });

    const { data: adminNewRequest, error: adminNewRequestError, isLoading: adminNewRequestLoading } = useCountActiveSchoolsWithoutRefIdQuery(undefined, {
        skip: !isAdmin
    });

    const { data: adminChangeRequest, error: adminChangeRequestError, isLoading: adminChangeRequestLoading } = useCountAllDraftsQuery(undefined, {
        skip: !isAdmin
    });

    const reminderData = data?.data || [];
    const schoolOwnerNotifications = Array.isArray(reminderData) ? reminderData : [reminderData];

    const reminderReviewAdminData = adminReviewData?.data || [];
    const adminReviewNotifications = Array.isArray(reminderReviewAdminData) ? reminderReviewAdminData : [reminderReviewAdminData];

    const newRequestCount = adminNewRequest?.data || 0;
    const changeRequestCount = adminChangeRequest?.data || 0;
    const pendingRequestCount = soPendingRequest?.data || 0;

    // School Owner Notifications content for Tooltip
    const schoolOwnerTooltipContent = (
        <div className="w-[230px] bg-white p-2">
            {(isLoading || soPendingRequestLoading) ? (
                <div className="py-2 text-center">Loading...</div>
            ) : (error && soPendingRequestError) ? (
                <div className="py-2 text-center">No new notifications</div>
            ) : (
                <>
                    {/* Pending Enrollment Requests Section */}
                    {pendingRequestCount > 0 && (
                        <div className="py-2 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    You have  {pendingRequestCount} pending enrollment request{pendingRequestCount !== 1 ? 's' : ''}
                                </div>
                                <Link
                                    className="text-blue-400 ml-1.5 font-medium"
                                    href="/public/school-owner/parent-management"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Overdue Requests Section */}
                    {schoolOwnerNotifications.length > 0 && (
                        schoolOwnerNotifications.map((item) => (
                            <div key={item.title || Math.random()} className="py-2">
                                <div className="flex justify-between items-center">
                                    <div>{item.description || 'No description'}</div>
                                    <Link
                                        className="font-medium text-blue-500"
                                        href="/public/school-owner/view-request?tab=Overdue"
                                    >
                                        Details
                                    </Link>
                                </div>


                            </div>
                        ))
                    )}

                    {/* Show "No new notifications" only if both sections are empty */}
                    {(pendingRequestCount === 0 && schoolOwnerNotifications.length === 0) && (
                        <div className="py-2 text-center">No new notifications</div>
                    )}
                </>
            )}
        </div>
    );

    // Admin Notifications content for Tooltip
    const adminTooltipContent = (
        <div className="w-[230px] bg-white p-2">
            {(adminLoading || adminNewRequestLoading || adminChangeRequestLoading) ? (
                <div className="py-2 text-center">Loading...</div>
            ) : (adminError && adminNewRequestError && adminChangeRequestError) ? (
                <div className="py-2 text-center">No new notifications</div>
            ) : (
                <>
                    {/* New Schools Without Ref ID Section */}
                    {newRequestCount > 0 && (
                        <div className="py-2 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-medium">{newRequestCount}</span> new school{newRequestCount !== 1 ? 's' : ''} awaiting approval
                                </div>
                                <Link
                                    className="text-blue-400 ml-1.5 font-medium"
                                    href="/admin/management/school/school-list"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Change Requests Section */}
                    {changeRequestCount > 0 && (
                        <div className="py-2 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-medium">{changeRequestCount}</span> change request{changeRequestCount !== 1 ? 's' : ''} awaiting approval
                                </div>
                                <Link
                                    className="text-blue-400 ml-1.5 font-medium"
                                    href="/admin/management/school/school-list"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Review Reports Section */}
                    {adminReviewNotifications.length > 0 && (
                        adminReviewNotifications.map((item) => (
                            <div key={item.schoolId} className="py-2 flex justify-between items-center">
                                <div>
                                    {item.total} pending reports of
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
                    )}

                    {/* Show "No new notifications" only if all sections are empty */}
                    {(newRequestCount === 0 && changeRequestCount === 0 && adminReviewNotifications.length === 0) && (
                        <div className="py-2 text-center">No new notifications</div>
                    )}
                </>
            )}
        </div>
    );

    return (
        <Tooltip
            title={isSchoolOwner ? schoolOwnerTooltipContent : isAdmin ? adminTooltipContent : null}
            placement="bottomRight"
            color="white"
            overlayInnerStyle={{ color: '#000' }}
            className="z-0"
        >
            <div className="cursor-pointer">
                <Badge
                    count={
                        isSchoolOwner
                            ? (error && soPendingRequestError)
                                ? 0
                                : schoolOwnerNotifications.length + (pendingRequestCount > 0 ? 1 : 0)
                            : isAdmin
                                ? (adminError && adminNewRequestError && adminChangeRequestError)
                                    ? 0
                                    : adminReviewNotifications.length +
                                    (newRequestCount > 0 ? 1 : 0) +
                                    (changeRequestCount > 0 ? 1 : 0)
                                : 0
                    }
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