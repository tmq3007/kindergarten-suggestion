'use client';

import { Image, Select } from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import React from "react";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";

const { Option } = Select;
const page = () => {
    return (
        <>
            <MyBreadcrumb
                paths={[
                    { label: 'School Management', href: '/admin/management/school/school-list' },
                    { label: 'Add new school' },
                ]}
            />
            <Image src='https://drive.google.com/file/d/13XE4Ah1aK5kSGniMbeard9DJ1iuroR_K/view'></Image>
            <div className='bg-white pt-1 rounded-lg'>
                <SchoolManageTitle title={'Add new school'} />
                <SchoolForm hasCancelButton={true} hasSaveButton={true} hasCreateSubmitButton={true} />
            </div>
        </>
    );
}

export default page;