'use client'
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolForm from "@/app/components/school/SchoolForm";
import {
    useGetDraftOfSchoolOwnerQuery,
    useGetSchoolOfSchoolOwnerQuery,
} from "@/redux/services/schoolOwnerApi";
import useSchoolForm from "@/lib/hook/useSchoolForm";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import React, { useState } from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";

export default function EditSchool() {
    const user = useSelector((state: RootState) => state.user);
    const hasDraft = user.hasDraft;
    const draftQuery = useGetDraftOfSchoolOwnerQuery(undefined, { skip: !hasDraft });
    const schoolQuery = useGetSchoolOfSchoolOwnerQuery(undefined, { skip: hasDraft });
    const schoolQueryResult = hasDraft ? draftQuery : schoolQuery;
    const {data, isLoading} = schoolQueryResult;
    const {form, formLoaded, schoolStatus, school} = useSchoolForm({
        data: data?.data,
        isLoading,
    });
    console.log("1: ",formLoaded);
    if (isLoading) {
        return (
            <>
                <MyBreadcrumb
                    paths={
                        hasDraft
                            ? [
                                {label: 'My Draft', href: '/public/school-owner/draft'},
                                {label: 'Edit school'}]
                            : [
                                {label: 'My School', href: '/public/school-owner'},
                                {label: 'Edit school'},
                            ]
                    }
                />
                <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus || 'Loading...'}/>
                <SchoolFormSkeleton/>
            </>
        );
    }

    return (
        <>
            <MyBreadcrumb
                paths={
                    hasDraft
                        ? [
                            {label: 'My Draft', href: '/public/school-owner/draft'},
                            {label: 'Edit school'}]
                        : [
                            {label: 'My School', href: '/public/school-owner'},
                            {label: 'Edit school'},
                        ]
                }
            />
            <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus}/>
            <SchoolForm
                form={form}
                hasCancelButton={true}
                hasUpdateSubmitButton={true}
                hasUpdateSaveButton={true}
                isEdit={true}
                triggerCheckEmail={null}
                formLoaded={formLoaded}
            />
        </>
    );
}