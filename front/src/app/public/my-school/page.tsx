'use client';
import { Tabs } from 'antd';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
const CurrentSchoolsSection = dynamic(() => import('@/app/components/parent/ParentCurrentSchoolList'));
const PreviousSchoolsSection = dynamic(() => import('@/app/components/parent/ParentPreviousSchoolList'));

const SchoolInfoTabs = () => {
    const [activeTab, setActiveTab] = useState('1'); // Mặc định là tab '1'

    const items = [
        {
            key: '1',
            label: 'Current Schools',
            children: <CurrentSchoolsSection />,
        },
        {
            key: '2',
            label: 'Previous Schools',
            children: <PreviousSchoolsSection />,
        },
    ];

    return (
        <div className='min-h-screen pt-24 px-3 md:px-10'>
        <MyBreadcrumb
            paths={[
                { label: 'My Schools' },
            ]}
        />

        <Tabs
            items={items}
            activeKey={activeTab} // Kiểm soát bằng state
            onChange={(key) => setActiveTab(key)} // Cập nhật state khi chuyển tab
            destroyInactiveTabPane={true}
        />
        </div>
    );
};

export default SchoolInfoTabs;