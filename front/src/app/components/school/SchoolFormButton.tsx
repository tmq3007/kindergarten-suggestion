import { Button } from "antd";
import { FormInstance } from "antd/es/form";
import React from "react";

interface ButtonGroupProps {
    form: FormInstance;
    hasSaveDraftButton?: boolean;
    hasSubmitButton?: boolean;
    isAddSchoolLoading?:boolean;
}



const SchoolFormButton: React.FC<ButtonGroupProps> = ({ form, hasSaveDraftButton, hasSubmitButton, isAddSchoolLoading }) => {
    const handleSaveDraft = () => {
        // Ensure `status` is set before submitting
        form.setFieldsValue({ status: 0 });

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
    return (
        <>
            <div className="flex lg:justify-center space-x-4 justify-end">
                <Button htmlType="button" onClick={() => form.resetFields()}>
                    Cancel
                </Button>
                {hasSaveDraftButton &&
                    <Button htmlType="button" onClick={handleSaveDraft} loading={isAddSchoolLoading}>
                        Save draft
                    </Button>
                }
                {hasSubmitButton &&
                    <Button type="primary" htmlType="button" onClick={handleSubmit} loading={isAddSchoolLoading}>
                        Submit
                    </Button>
                }
            </div>
        </>
    );
}

export default SchoolFormButton;