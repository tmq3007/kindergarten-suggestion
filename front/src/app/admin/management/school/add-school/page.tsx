'use client';

import {Image, Select} from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import React from "react";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import {useLazyCheckSchoolEmailQuery} from "@/redux/services/schoolApi";

const {Option} = Select;
const page = () => {
    const [triggerCheckEmail] = useLazyCheckSchoolEmailQuery();
    return (
        <>
            <MyBreadcrumb
                paths={[
                    {label: 'School Management', href: '/admin/management/school/school-list'},
                    {label: 'Add new school'},
                ]}
            />
            <SchoolManageTitle title={'Add new school'}/>
            <div className='bg-white pt-1 !mb-10 rounded-lg'>
                <SchoolForm
                    isEdit={false}
                    hasCancelButton={true}
                    hasSaveButton={true}
                    hasCreateSubmitButton={true}
                    triggerCheckEmail={triggerCheckEmail}
                />
            </div>
        </>
    );
}

export default page;