'use client';

import { Image, Select } from 'antd';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import React from "react";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolForm from "@/app/components/school/SchoolForm";

const { Option } = Select;
const page = () => {

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
                <SchoolForm hasCancelButton={true} hasSaveButton={true} hasCreateSubmitButton={true} triggerCheckEmail={true}/>
            </div>
        </>
    );
}

export default page;