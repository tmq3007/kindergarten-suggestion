// schoolUtils.ts
import {FormInstance} from "antd/es/form";
import {UploadFile} from "antd";
import {SchoolDTO, SchoolUpdateDTO} from "@/redux/services/schoolApi";
import {message} from "antd";
import React from "react";

export const formatErrorMessage = (error: unknown): string | React.ReactNode => {
    let errorMessage: string | React.ReactNode = 'There was an error while adding the school. Please try again.';

    if (error && typeof error === 'object' && 'data' in error) {
        const errorData = (error as {
            data?: {
                message?: string;
                fieldErrors?: { message: string }[];
                globalErrors?: { message: string }[];
            }
        }).data;

        const allErrorMessages: string[] = [];

        if (errorData?.fieldErrors && errorData.fieldErrors.length > 0) {
            allErrorMessages.push(...errorData.fieldErrors.map(err => err.message));
        }

        if (errorData?.globalErrors && errorData.globalErrors.length > 0) {
            allErrorMessages.push(...errorData.globalErrors.map(err => err.message));
        }

        if (allErrorMessages.length > 0) {
            errorMessage = allErrorMessages.map((msg, index) => (
                <React.Fragment key={index}>
                    {'-' + msg}
                    {index < allErrorMessages.length - 1 && <br/>}
                </React.Fragment>
            ));
        } else if (errorData?.message) {
            errorMessage = errorData.message;
        }
    } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    return errorMessage;
};

export const prepareSchoolData = async (
    form: FormInstance,
    emailInputRef: React.RefObject<any>,
    phoneInputRef: React.RefObject<any>,
    messageApi: any
): Promise<SchoolDTO | SchoolUpdateDTO | null> => {
    try {
        // Validate form fields and get values
        const values = await form.validateFields();
        // Validate email and phone using refs from SchoolForm

        const isEmailValid = await emailInputRef?.current?.validateEmail();
        const isPhoneValid = await phoneInputRef?.current?.validatePhone();

        if (!isEmailValid || !isPhoneValid) {
            console.log('Validation failed');
            messageApi.error("Email or phone validation failed. Please check your inputs.");
            return null;
        }
        const fileList: File[] = (values.image as UploadFile[] || [])
            .filter((file) => file.originFileObj)
            .map((file) => file.originFileObj as File);
        const fullPhoneNumber = phoneInputRef?.current?.getFormattedPhoneNumber() || values.phone;

        // Prepare final data
        return {
            ...values,
            image: fileList,
            phone: fullPhoneNumber,
        };
    } catch (error) {
        console.error("Form validation failed:", error);
        return null; // Return null if validation fails
    }
};