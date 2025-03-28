'use client'

import {Badge, Card, Segmented, Tabs} from "antd";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import {
    useGetCountEnrollRequestBySchoolQuery,
    useListEnrollRequestBySchoolWithFilterQuery,
    useListParentBySchoolWithFilterQuery
} from "@/redux/services/parentApi";
import {useState, useCallback, useMemo} from "react";
import ParentListWrapper from "@/app/components/parent/ParentListWrapper";
import {SegmentedValue} from "antd/es/segmented";
import type {TabsProps} from 'antd';
import useIsMobile from "@/lib/hook/useIsMobile";
import {ClockCircleOutlined, UserOutlined} from "@ant-design/icons";
import {setPendingRequestsCount} from "@/redux/features/parentSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/store";

const searchOptions = [
    {value: "username", label: "Username"},
    {value: "fullname", label: "Fullname"},
    {value: "email", label: "Email"},
    {value: "phone", label: "Phone"},
];

const TAB_KEYS = {
    ACTIVE_PARENTS: "1",
    PENDING_REQUESTS: "2"
} as const;

export default function ParentManagementPage() {
    const [activeTabKey, setActiveTabKey] = useState<string>(TAB_KEYS.ACTIVE_PARENTS);
    const dispatch = useDispatch();
    const pendingRequestsCount = useSelector((state: RootState) => state.parentInfor.pendingRequestsCount);
    const isMobile = useIsMobile();

    // Fetch enroll requests data on page load
    const {data: enrollRequestsData} = useGetCountEnrollRequestBySchoolQuery();
    // Update pending requests count in Redux when data is available
    useMemo(() => {
        if (enrollRequestsData?.data !== undefined) {
            dispatch(setPendingRequestsCount(enrollRequestsData.data));
        }
    }, [dispatch, enrollRequestsData?.data]);


    const handleTabChange = useCallback((value: SegmentedValue) => {
        setActiveTabKey(value.toString());
    }, []);

    const segmentOptions = useMemo(() => [
        {
            label: isMobile ? (
                <UserOutlined className="text-2xl"/>
            ) : (
                <span className="font-bold text-2xl flex content-center text-center justify-center gap-2">
                    <UserOutlined/> Active Parents
                </span>
            ),
            value: TAB_KEYS.ACTIVE_PARENTS
        },
        {
            label: isMobile ? (
                <Badge
                    count={pendingRequestsCount}
                    overflowCount={99}
                    offset={[10, 0]}
                >
                    <ClockCircleOutlined className="text-2xl"/>
                </Badge>
            ) : (
                <span className="font-bold text-2xl flex content-center text-center justify-center gap-2">
                    <ClockCircleOutlined/>
                    Pending Requests
                    <Badge
                        count={pendingRequestsCount}
                        overflowCount={99}
                        offset={[10, 0]}
                    />
                </span>
            ),
            value: TAB_KEYS.PENDING_REQUESTS
        }
    ], [isMobile, pendingRequestsCount]);


    const tabItems: TabsProps['items'] = [
        {
            key: TAB_KEYS.ACTIVE_PARENTS,
            label: 'Active Parents',
            children: (
                <ParentListWrapper
                    title={"My School Parents"}
                    isEnrollPage={false}
                    useQueryTrigger={useListParentBySchoolWithFilterQuery}
                    searchOptions={searchOptions}
                />
            ),
        },
        {
            key: TAB_KEYS.PENDING_REQUESTS,
            label: 'Pending Enrollment Requests',
            children: (
                <ParentListWrapper
                    isEnrollPage={true}
                    title={"Enroll Requests"}
                    useQueryTrigger={useListEnrollRequestBySchoolWithFilterQuery}
                    searchOptions={searchOptions}
                />
            ),
        },
    ];

    return (
        <>
            <div>
                <MyBreadcrumb
                    paths={[
                        {label: "Parent Management", href: "/public/school-owner/parent-management"},
                        {label: "Parent List"},
                    ]}
                />
                <Card
                    title={
                        <Segmented
                            className="p-1"
                            options={segmentOptions}
                            value={activeTabKey}
                            onChange={handleTabChange}
                            block
                        />
                    }
                >
                    <Tabs
                        activeKey={activeTabKey}
                        tabBarStyle={{display: "none"}}
                        size="large"
                        destroyInactiveTabPane
                        items={tabItems}
                    />
                </Card>
            </div>

        </>
    );
}