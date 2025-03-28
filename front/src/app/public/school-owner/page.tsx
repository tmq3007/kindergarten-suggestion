"use client";

import {Empty, Form, message} from "antd";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import {ROLES} from "@/lib/constants";
import {useSelector} from "react-redux";
import {RootState} from '@/redux/store';
import SchoolFormWrapper from "@/app/components/school/SchoolFormWrapper";
import {useGetSchoolOfSchoolOwnerQuery} from "@/redux/services/schoolOwnerApi";
import DetailPageSkeleton from "@/app/components/skeleton/DetailPageSkeleton";
import useSchoolForm from "@/lib/hook/useSchoolForm";
import Link from "next/link";

export default function SchoolDetail() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const role = user.role;
    const hasSchool = user.hasSchool;

    if (!hasSchool) {
        return (
            <div className={'h-full flex items-center justify-center'}>
                <Empty/>
            </div>
        )
    }

    console.log(user)
    //Check role user
    const unauthorized = () => {
        router.push("/login");
    };

    if (!role || role !== ROLES.SCHOOL_OWNER) {
        unauthorized();
        return null;
    }

    //get school by user id
    const {data, isError,refetch,isFetching, isLoading} = useGetSchoolOfSchoolOwnerQuery(undefined, {
        skip: !hasSchool,
    });

    // Refetch the school data when the user changes
    useEffect(() => {
        refetch();
    }, [user.id, refetch]);

    const [form] = Form.useForm();
    const {school, schoolStatus} = useSchoolForm({
        data: data?.data,
        isLoading,
        externalForm: form,
    });

    useEffect(() => {
        if (isError) {
            message.error("Failed to load school details").then(r => {
            });
        }
    }, [isError, router]);

    if (isLoading || isFetching) {
        const paths = [
            {label: "My School", href: '/public/school-owner'},
            {label: "School Detail"},
        ]
        return (
            <DetailPageSkeleton paths={paths}/>
        );
    }

    return (
        <div className="pt-2 ">
            <MyBreadcrumb
                paths={[
                    {label: "My School", href: "/public/school-owner"},
                    {label: "School Detail"},
                ]}
            />
            <SchoolManageTitle title={"School details"} schoolStatus={schoolStatus!}/>

            {/*View Rating and Feedback Link*/}
            <div className="my-4 flex justify-end mr-8">
                <Link href={`/public/school-owner/rating-feedback`}
                      className="text-blue-500 hover:underline">
                    View Rating & Feedback
                </Link>
            </div>

            <div className="read-only-form email-locked">
                <SchoolFormWrapper form={form} school={school!} isDetailPage={true}/>
            </div>
        </div>
    );
}