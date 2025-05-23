'use client'
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SchoolForm from "@/app/components/school/SchoolForm";
import {useGetDraftOfSchoolOwnerQuery, useGetSchoolOfSchoolOwnerQuery,} from "@/redux/services/schoolOwnerApi";
import useSchoolForm from "@/lib/hook/useSchoolForm";
import SchoolFormSkeleton from "@/app/components/skeleton/SchoolFormSkeleton";
import React from "react";
import {useCheckEditSchoolEmailMutation} from "@/redux/services/schoolApi";

export default function EditSchool() {
    const {
        data: draftData,
        isLoading: isDraftLoading,
        isSuccess: isDraftSuccess,
    } = useGetDraftOfSchoolOwnerQuery();

    // Only call school query if no draft available
    const shouldSkipSchoolQuery = isDraftSuccess || !!draftData?.data;
    const {
        data: schoolData,
        isLoading: isSchoolLoading,
    } = useGetSchoolOfSchoolOwnerQuery(undefined, {
        skip: shouldSkipSchoolQuery,
    });

    const draft = draftData?.data;
    const isUsingDraft = !!draft;

    const isLoading = isUsingDraft
        ? isDraftLoading
        : isSchoolLoading;

    const data = isUsingDraft ? draftData : schoolData;

    const {form, formLoaded, schoolStatus, school} = useSchoolForm({
        data: data?.data,
        isLoading,
    });
    const [triggerCheckEditEmail] = useCheckEditSchoolEmailMutation();

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
                triggerCheckEmail={triggerCheckEditEmail}
                formLoaded={formLoaded}
                schoolId={school?.id}
            />
        </>
    );
}