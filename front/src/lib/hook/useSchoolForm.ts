'use client';

import {useEffect, useState}from 'react';
import {Form}from 'antd';
import {SchoolDetailVO, SchoolVO}from "@/redux/services/schoolApi";
import {SCHOOL_STATUS_OPTIONS}from "@/lib/constants";
import {formatPhoneNumber}from "@/lib/util/phoneUtils";

interface SchoolFormData {
data?: SchoolVO | SchoolDetailVO;
isLoading: boolean;
}

export default function useSchoolForm({data, isLoading}: SchoolFormData) {
    const school = data;
    const schoolStatus =
        SCHOOL_STATUS_OPTIONS.find((s) => s.value === String(school?.status))?.label || undefined;
    const [formLoaded, setFormLoaded] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
    console.log("2: ",formLoaded);

        if (school) {
            form.setFieldsValue({
                name: school.name || '',
                schoolType: String(school.schoolType),
                province: school.province || '',
                district: school.district || '',
                ward: school.ward || '',
                street: school.street || '',
                email: school.email || '',
                phone: formatPhoneNumber(school.phone),
                countryCode: formatPhoneNumber(school.phone, 0),
                receivingAge: String(school.receivingAge),
                educationMethod: String(school.educationMethod),
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                facilities: school.facilities?.map((f) => String(f.fid)) || [],
                utilities: school.utilities?.map((u) => String(u.uid)) || [],
                description: school.description || '',
                website: school.website || '',
                image: school.imageList || [],
            });
            setFormLoaded(true);
        }
    console.log("3: ",formLoaded);

    }, [school, form]);

    return {form,formLoaded, schoolStatus, school, isLoading};
}
