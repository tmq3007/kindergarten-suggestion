'use client';
import {Tabs} from 'antd';
import dynamic from 'next/dynamic';
import React, {useState} from 'react';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";

const CurrentSchoolsSection = dynamic(() => import('@/app/components/parent/ParentCurrentSchoolList'));
const PreviousSchoolsSection = dynamic(() => import('@/app/components/parent/ParentPreviousSchoolList'));

const SchoolInfoTabs = () => {
    const [activeTab, setActiveTab] = useState('1'); // Mặc định là tab '1'
    const router = useRouter();

    const userIdString = useSelector((state: RootState) => state.user?.id);
    const userId = userIdString ? parseInt(userIdString as string) : null;

    if (!userId) {
        console.warn("No userId found in Redux store, redirecting to login");
        router.push("/public");
        return null;
    }

    const items = [
        {
            key: '1',
            label: 'Current Schools',
            children: <CurrentSchoolsSection/>,
        },
        {
            key: '2',
            label: 'Previous Schools',
            children: <PreviousSchoolsSection/>,
        },
    ];

    return (
        <div className='min-h-screen pt-24 px-3 md:px-10'>
            <MyBreadcrumb
                paths={[
                    {label: 'My Schools'},
                ]}
            />

            <SchoolManageTitle title={'My Schools'}/>

            <Tabs
                items={items}
                activeKey={activeTab} // Kiểm soát bằng state
                onChange={(key) => setActiveTab(key)} // Cập nhật state khi chuyển tab
                destroyInactiveTabPane={true}
                type="card" rootClassName="border-cyan-500"
                size="large" animated={{inkBar: true, tabPane: true}}
            />
        </div>
    );
};

export default SchoolInfoTabs;