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
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";

export default function EditSchool() {
    const user = useSelector((state: RootState) => state.user);
    const hasDraft = user.hasDraft;
    const {data: getDraftData, isLoading: isGetDraftLoading} = useGetDraftOfSchoolOwnerQuery(undefined, {
        skip: !hasDraft,
    });
    const draft = getDraftData?.data;
    const draftQuery = useGetDraftOfSchoolOwnerQuery();
    const schoolQuery = useGetSchoolOfSchoolOwnerQuery();
    const schoolQueryResult = draft ? draftQuery : schoolQuery;
    const {data, isLoading} = schoolQueryResult;
    const {form, formLoaded, schoolStatus, school} = useSchoolForm({
        data: data?.data,
        isLoading,
    });
    console.log("school ", school);
    if (isLoading) {
        return (
            <>
                <MyBreadcrumb
                    paths={
                        (draft)
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
                    draft
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
                schoolId={school?.id}
            />
        </>
    );
}