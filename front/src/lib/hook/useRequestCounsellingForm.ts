'use client'

import {RequestCounsellingVO} from "@/redux/services/requestCounsellingApi";
import {Form} from "antd";
import {useEffect, useState} from "react";

interface UseRequestCounsellingFormProps {
    data?: RequestCounsellingVO;
    isLoading: boolean;
    externalForm?: ReturnType<typeof Form.useForm>[0];
}

export default function useRequestCounsellingForm({data, isLoading, externalForm}: UseRequestCounsellingFormProps) {
    const requestCounselling = data;

    const [form] = Form.useForm();
    const usedForm = externalForm || form;

    const [formLoaded, setFormLoaded] = useState(false);

    useEffect(() => {
        if (requestCounselling) {
            usedForm.setFieldsValue({
                full_name: requestCounselling.name || '',
                email: requestCounselling.email || '',
                phone: requestCounselling.phone || '',
                address: requestCounselling.address || '',
                requested_school: requestCounselling.schoolName || '',
                inquiries: requestCounselling.inquiry || '',
            });

            setFormLoaded(true);
        }
    }, [requestCounselling, usedForm]);

    return {form: usedForm, formLoaded, requestCounselling, isLoading};
}