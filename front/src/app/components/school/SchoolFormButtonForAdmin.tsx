import {Button, UploadFile} from "antd";
import React from "react";
import {useParams, useRouter} from "next/navigation";
import {SchoolDTO, useAddSchoolMutation, useUpdateSchoolByAdminMutation} from "@/redux/services/schoolApi";
import {ButtonGroupProps} from "@/app/components/school/SchoolFormButton";
import countriesKeepZero from "@/lib/countriesKeepZero";

const SchoolFormButtonForAdmin: React.FC<ButtonGroupProps> = (
    {
        form,
        hasCancelButton,
        hasSaveButton,
        hasCreateSubmitButton,
        hasUpdateSubmitButton,
        hasDeleteButton,
        hasEditButton,
        hasRejectButton,
        hasApproveButton,
        hasPublishButton,
        hasUnpublishButton,
        selectedCountry,
    }
) => {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.id;
    const [updateSchoolByAdmin, {data, isLoading}] = useUpdateSchoolByAdminMutation();
    const [addSchool] = useAddSchoolMutation();

    const handleSave = () => {
    };

    const handleCreateSubmit = async () => {
        try {
            // Validate form fields before proceeding
            const values = await form.validateFields();
            // Process phone number formatting
            let formattedPhone = values.phone || "";
            if (selectedCountry && !countriesKeepZero.includes(selectedCountry.dialCode) && formattedPhone.startsWith("0")) {
                formattedPhone = formattedPhone.substring(1);
            }
            const fullPhoneNumber = selectedCountry ? `${selectedCountry.dialCode} ${formattedPhone}` : formattedPhone;
            // Extract uploaded images from form data
            const fileList: File[] = (values.image || [])
                .filter((file: UploadFile) => file.originFileObj) // Ensure the file is a valid object
                .map((file: UploadFile) => file.originFileObj as File);
            // Prepare the final data object to submit
            const finalValues: SchoolDTO = {
                ...values,
                image: fileList,
                phone: fullPhoneNumber,
                status: 1, // Set status to 1 when creating a new school
            };

            // Ensure email validation is successful before submitting
            //========================================> NECESSARY? <++++++++++++++++++++++++++++++++
            // if (emailStatus !== 'success') {
            //     return;
            // }

            // Submit the processed data to the server
            await addSchool(finalValues);

        } catch (error) {
            console.error("Validation failed:", error);
        }
    };


    const handleUpdateSubmit = async () => {
        try {
            // Get form values
            const values = await form.validateFields();
            await updateSchoolByAdmin({id: Number(schoolId), ...values});
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handlePublish = () => {

    };

    const handleUnpublish = () => {

    };

    const handleDelete = () => {

    };

    const handleApprove = () => {

    };

    const handleReject = () => {

    };

    const handleEdit = () => {
        router.push(`/admin/management/school/edit-school/${schoolId}`);
    };
    return (
        <>
            <div className="flex lg:justify-center space-x-4 justify-end">
                {hasCancelButton &&
                    <Button
                        htmlType="button"
                        onClick={handleCancel}
                        className={'bg-red-500 text-white border-red-900'}
                    >
                        Cancel
                    </Button>
                }
                {hasSaveButton &&
                    <Button
                        htmlType="button"
                        onClick={handleSave}
                        className={'bg-gray-300 text-gray-800 border-gray-900'}
                    >
                        Save
                    </Button>
                }
                {hasCreateSubmitButton &&
                    <Button
                        htmlType="button"
                        onClick={handleCreateSubmit}
                        className={'bg-blue-300 text-blue-800 border-blue-900'}
                    >
                        Submit
                    </Button>
                }
                {hasUpdateSubmitButton &&
                    <Button
                        htmlType="button"
                        onClick={handleUpdateSubmit}
                        className={'bg-blue-300 text-blue-800 border-blue-900'}
                    >
                        Submit
                    </Button>
                }
                {hasDeleteButton &&
                    <Button
                        htmlType="button"
                        onClick={handleDelete}
                        className={'bg-orange-300 text-orange-800 border-orange-900'}
                    >
                        Delete
                    </Button>
                }
                {hasEditButton &&
                    <Button
                        htmlType="button"
                        onClick={handleEdit}
                        className={'bg-blue-300 text-blue-800 border-blue-900'}
                    >
                        Edit
                    </Button>
                }
                {hasRejectButton &&
                    <Button
                        htmlType="button"
                        onClick={handleReject}
                        className={'bg-red-300 text-red-800 border-red-900'}
                    >
                        Reject
                    </Button>
                }
                {hasApproveButton &&
                    <Button
                        htmlType="button"
                        onClick={handleApprove}
                        className={'bg-yellow-300 text-yellow-800 border-yellow-900'}
                    >
                        Approve
                    </Button>
                }
                {hasPublishButton &&
                    <Button
                        htmlType="button"
                        onClick={handlePublish}
                        className={'bg-green-300 text-green-800 border-green-900'}
                    >
                        Publish
                    </Button>
                }
                {hasUnpublishButton &&
                    <Button
                        htmlType="button"
                        onClick={handleUnpublish}
                        className={'bg-purple-300 text-purple-800 border-purple-900'}
                    >
                        Unpublish
                    </Button>
                }
            </div>
        </>
    );
}

export default SchoolFormButtonForAdmin;