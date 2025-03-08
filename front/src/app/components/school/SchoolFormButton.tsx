import {Button} from "antd";
import {FormInstance} from "antd/es/form";
import React from "react";

interface ButtonGroupProps {
    form: FormInstance;
    hasCancelButton?: boolean;
    hasSaveButton?: boolean;
    hasSubmitButton?: boolean;
    hasDeleteButton?: boolean;
    hasEditButton?: boolean;
    hasRejectButton?: boolean;
    hasApproveButton?: boolean;
    hasPublishButton?: boolean;
    hasUnpublishButton?: boolean;
    isAddSchoolLoading?: boolean;
}


const SchoolFormButton: React.FC<ButtonGroupProps> = (
    {
        form,
        hasCancelButton,
        hasSaveButton,
        hasSubmitButton,
        hasDeleteButton,
        hasEditButton,
        hasRejectButton,
        hasApproveButton,
        hasPublishButton,
        hasUnpublishButton,
        isAddSchoolLoading
    }) => {
    const handleSave = () => {
        // Ensure `status` is set before submitting
        form.setFieldsValue({status: 0});

        // Submit the form manually
        form.submit();
    };

    const handleSubmit = async () => {
        try {
            // Get form values
            const values = await form.validateFields();
            console.log("✅ Form values:", values);
        } catch (error) {
            console.error("❌ Validation failed:", error);
        }
    };

    const handleCancel = () => {

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
                        onClick={handleSave} loading={isAddSchoolLoading}
                        className={'bg-gray-300 text-gray-800 border-gray-900'}
                    >
                        Save
                    </Button>
                }
                {hasSubmitButton &&
                    <Button
                        htmlType="button"
                        onClick={handleSubmit} loading={isAddSchoolLoading}
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

export default SchoolFormButton;