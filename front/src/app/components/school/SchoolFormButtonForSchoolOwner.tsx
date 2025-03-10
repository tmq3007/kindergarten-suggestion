import {Button, message} from "antd";
import React from "react";
import {useParams, useRouter} from "next/navigation";
import {ButtonGroupProps} from "@/app/components/school/SchoolFormButton";
import {useUpdateSchoolStatusBySchoolOwnerMutation} from "@/redux/services/schoolApi";


const SchoolFormButtonForSchoolOwner: React.FC<ButtonGroupProps> = (
    {
        form,
        hasCancelButton,
        hasSaveButton,
        hasCreateSubmitButton,
        hasUpdateSubmitButton,
        hasDeleteButton,
        hasEditButton,
        hasPublishButton,
        hasUnpublishButton,
        selectedCountry,
    }
) => {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.id;
    const [updateSchoolStatusBySchoolOwner, {isLoading: isUpdatingStatus}] = useUpdateSchoolStatusBySchoolOwnerMutation();
    const [messageApi, contextHolder] = message.useMessage();
    const handleSave = () => {

    };

    const handleCreateSubmit = async () => {

    };

    const handleUpdateSubmit = async () => {

    };

    const handleCancel = () => {

    };

    const handlePublish = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 4 } }).unwrap();
            messageApi.success('School published successfully!')
        } catch (error) {
            messageApi.error("Failed to publish school. Please try again.");
        }
    };
    const handleUnpublish = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 5 } }).unwrap();
            messageApi.success('School unpublished successfully!')
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
    };

    const handleDelete = async () => {
        try {
            await updateSchoolStatusBySchoolOwner({ schoolId: Number(schoolId), changeSchoolStatusDTO: { status: 5 } }).unwrap();
            messageApi.success('School unpublished successfully!')
        } catch (error) {
            messageApi.error("Failed to unpublish school. Please try again.");
        }
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

export default SchoolFormButtonForSchoolOwner;