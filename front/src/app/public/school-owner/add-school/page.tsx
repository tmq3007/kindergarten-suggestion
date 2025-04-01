'use client';

import { Image, Select } from 'antd';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import React from "react";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolForm from "@/app/components/school/SchoolForm";
import { useLazyCheckSchoolEmailQuery } from '@/redux/services/schoolApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const { Option } = Select;
const page = () => {
    const [triggerCheckEmail] = useLazyCheckSchoolEmailQuery();
    const user = useSelector((state: RootState) => state.user);
    return (
        <>
            <MyBreadcrumb
                paths={[
                    { label: 'School Management', href: '/school' },
                    { label: 'Add new school' },
                ]}
            />
            <div className='bg-white pt-1 rounded-lg'>
                <SchoolManageTitle title={'Add new school'} />
                <SchoolForm hasCancelButton={true} hasCreateSaveButton={true} hasCreateSubmitButton={true} triggerCheckEmail={triggerCheckEmail} />
            </div>
        </>
    );
}

export default page;