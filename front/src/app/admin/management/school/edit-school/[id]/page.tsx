'use client';
import {useParams} from 'next/navigation';
import {useGetSchoolQuery} from '@/redux/services/schoolApi';
import React, { useEffect, useState } from 'react';
import SchoolFormSkeleton from '@/app/components/skeleton/SchoolFormSkeleton';
import SchoolForm from '@/app/components/school/SchoolForm';
import MyBreadcrumb from '@/app/components/common/MyBreadcrumb';
import SchoolManageTitle from '@/app/components/school/SchoolManageTitle';
import useSchoolForm from "@/lib/hook/useSchoolForm";

export default function EditSchool() {
    const params = useParams();
    const schoolId = params.id;

    const {data, isLoading} = useGetSchoolQuery(Number(schoolId));
    const {form, formLoaded,schoolStatus, school} = useSchoolForm({
        data: data?.data,
        isLoading,
    });
    if (isLoading || !school) {
        return (
            <>
                <MyBreadcrumb paths={[{label: 'School Management'}, {label: 'Edit school'}]}/>
                <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus || 'Loading...'}/>
                <SchoolFormSkeleton/>
            </>
        );
    }
    return (
        <>
            <MyBreadcrumb
                paths={[
                    {label: 'School Management', href: '/admin/management/school/school-list'},
                    {label: 'Edit school'},
                ]}
            />
            <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus!}/>
            <SchoolForm
                form={form}
                hasCancelButton={true}
                hasUpdateSubmitButton={true}
                isEdit={true}
                triggerCheckEmail={null}
                schoolId={Number(schoolId)}
                formLoaded={formLoaded}
            />
        </>
    );
}