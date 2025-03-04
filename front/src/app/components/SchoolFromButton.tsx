import { Button } from "antd";
import {FormInstance } from "antd/es/form";
import React from "react";

interface ButtonGroupProps {
    form: FormInstance;
    onSaveDraft?: () => void;
  }

const SchoolFromButton: React.FC<ButtonGroupProps> = ({form, onSaveDraft}) => {
    return (
        <>
            <div className="flex lg:justify-center space-x-4 justify-end">
                <Button htmlType="button" onClick={() => form.resetFields()}>
                    Cancel
                </Button>
                <Button htmlType="button">
                    Save draft
                </Button>
                <Button type="primary" htmlType="submit" >
                    Submit
                </Button>
            </div>
        </>
    );
}

export default SchoolFromButton;