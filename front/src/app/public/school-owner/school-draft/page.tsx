"use client"
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolForm from "@/app/components/school/SchoolForm";
import React from "react";
import ContentPage from "@/app/public/school-owner/school-draft/contentPage";

const page = () => {
     return (
        <>
            <MyBreadcrumb
                paths={[
                    { label: 'Home', href: '/public' },
                    { label: 'My draft' },
                ]}
            />
            <SchoolManageTitle title={'My Draft'} />
            <div className='bg-white pt-1 rounded-lg'>
                <ContentPage/>
             </div>
        </>
    );
}

export default page;