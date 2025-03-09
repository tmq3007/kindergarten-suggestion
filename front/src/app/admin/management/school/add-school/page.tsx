'use client';

import {Select} from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';
import {h2} from 'framer-motion/client';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import React from "react";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";

const {Option} = Select;
const page = () => {
    return (
        <>
            <MyBreadcrumb
                paths={[
                    {label: 'School Management', href: '/admin/management/school/school-list'},
                    {label: 'Add new school'},
                ]}
            />
            <SchoolManageTitle title={'Add new school'}/>
            <SchoolForm hasCancelButton={true} hasSaveButton={true} hasSubmitButton={true}/>
        </>
    );
}

export default page;