import {Button} from "antd";
import {FormInstance} from "antd/es/form";
import React from "react";

interface ButtonGroupProps {
    form: FormInstance;
    hasSaveDraftButton?: boolean;
    hasSubmitButton?: boolean;
}

const onSaveDraft = () => {
}

const SchoolFormButton: React.FC<ButtonGroupProps> = ({form, hasSaveDraftButton, hasSubmitButton}) => {
    return (
        <>
            <div className="flex lg:justify-center space-x-4 justify-end">
                <Button htmlType="button" onClick={() => form.resetFields()}>
                    Cancel
                </Button>
                {hasSaveDraftButton &&
                    <Button htmlType="button">
                        Save draft
                    </Button>
                }
                {hasSubmitButton &&
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                }
            </div>
        </>
    );
}

export default SchoolFormButton;