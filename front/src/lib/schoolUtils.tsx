// schoolUtils.ts
import { FormInstance } from "antd/es/form";
import { UploadFile } from "antd";
import { SchoolDTO, SchoolUpdateDTO } from "@/redux/services/schoolApi";
import { message } from "antd";
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
                    {index < allErrorMessages.length - 1 && <br />}
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

const convertUrlToFile = async (fileUrl: string, fileName: string = "image.jpg") => {

    // Dùng proxy API để lấy ảnh từ Google Drive
    const proxyUrl = `/api/image?url=${encodeURIComponent(fileUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
    } catch (error) {
        console.error("❌ Lỗi khi tải ảnh qua proxy:", error);
        return null;
    }
};


export const prepareSchoolData = async (form: FormInstance, emailInputRef: any, phoneInputRef: any, messageApi: any) => {
    try {
        const values = await form.validateFields();

        const fileList: UploadFile[] = form.getFieldValue('image') || [];

        // Chuyển tất cả ảnh thành File
        const imagesToSend = await Promise.all(
            fileList.map(async (file) => {
                if (file.originFileObj) {
                    return file.originFileObj; // Ảnh mới upload
                } else if (file.url) {
                    return await convertUrlToFile(file.url, file.name || "image.jpg"); // Ảnh từ database
                }
                return null;
            })
        );
        console.log('before fullPhoneNumber:', phoneInputRef?.current);
        const fullPhoneNumber = phoneInputRef?.current?.getFormattedPhoneNumber() || values.phone;
        console.log('after fullPhoneNumber:', fullPhoneNumber);


        //TODO:remove this when done
        let tempSO = values.schoolOwners;
        if (tempSO === undefined) {
            tempSO = []; // ✅ Gán lại thành mảng rỗng nếu bị undefined
        }
        // Prepare final data
        return {
            ...values,
            image: imagesToSend.filter(Boolean), // Loại bỏ giá trị null
            phone: fullPhoneNumber,
            schoolOwners: tempSO,
        };
    } catch (error) {
        console.error("❌ Form validation failed:", error);
        return null;
    }
};
