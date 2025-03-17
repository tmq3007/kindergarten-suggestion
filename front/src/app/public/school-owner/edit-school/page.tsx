'use client'
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolForm from "@/app/components/school/SchoolForm";
import {useGetSchoolOfSchoolOwnerQuery} from "@/redux/services/schoolOwnerApi";
import useSchoolForm from "@/lib/hook/useSchoolForm";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import React from "react";

export default function EditSchool() {
    const {data, isLoading} = useGetSchoolOfSchoolOwnerQuery();
    const { form, formLoaded, schoolStatus, school } = useSchoolForm({
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
            <SchoolManageTitle title={'Edit School'}/>
            <SchoolForm
                form={form}//
                hasCancelButton={true}
                hasUpdateSubmitButton={true}
                isEdit={true}
                triggerCheckEmail={null}
                formLoaded={formLoaded} // Pass to SchoolForm
            />
        </>
    );
}