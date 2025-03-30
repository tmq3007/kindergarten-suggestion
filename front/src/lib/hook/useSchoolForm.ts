'use client';

import {useEffect, useLayoutEffect, useState} from 'react';
import {Form} from 'antd';
import {SchoolDetailVO, SchoolVO} from "@/redux/services/schoolApi";
import {SCHOOL_STATUS_OPTIONS} from "@/lib/constants";
import {formatPhoneNumber} from "@/lib/util/phoneUtils";

interface UseSchoolFormProps {
    data?: SchoolVO | SchoolDetailVO;
    isLoading: boolean;
    externalForm?: ReturnType<typeof Form.useForm>[0];
}

export default function useSchoolForm({data, isLoading, externalForm}: UseSchoolFormProps) {
    const school = data;
    const schoolStatus =
        SCHOOL_STATUS_OPTIONS.find((s) => s.value === String(school?.status))?.label || undefined;

    const [form] = Form.useForm();
    const usedForm = externalForm || form;

    const [formLoaded, setFormLoaded] = useState(false);

    useLayoutEffect(() => {
        if (school) {
            const validEducationMethod = school.educationMethod != null ? String(school.educationMethod) : '0';
            const validReceivingAge = school.receivingAge != null ? String(school.receivingAge) : '0';

            usedForm.setFieldsValue({
                name: school.name || '',
                schoolType: school.schoolType != null ? String(school.schoolType) : '0',
                province: school.province || '',
                district: school.district || '',
                ward: school.ward || '',
                street: school.street || '',
                email: school.email || '',
                phone: formatPhoneNumber(school.phone),
                countryCode: formatPhoneNumber(school.phone, 0),
                website: school.website || '',
                receivingAge: validReceivingAge,
                educationMethod: validEducationMethod,
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                description: school.description || '',
                status: school.status || 0,
                facilities: school.facilities?.map(f => String(f.fid)) || [],
                utilities: school.utilities?.map(u => String(u.uid)) || [],
                image: school.imageList || [],
                schoolOwnersInitialList: school.schoolOwners || [],
            });

            setFormLoaded(true);
        }
    }, [school, usedForm]);

    return {form: usedForm, formLoaded, schoolStatus, school, isLoading};
}
