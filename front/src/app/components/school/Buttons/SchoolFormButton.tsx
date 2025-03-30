import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {ROLES} from "@/lib/constants";
import SchoolFormButtonForAdmin from "@/app/components/school/Buttons/SchoolFormButtonForAdmin";
import {FormInstance} from "antd/es/form";
import SchoolFormButtonForSchoolOwner from "@/app/components/school/Buttons/SchoolFormButtonForSchoolOwner";
import React from "react";

export interface ButtonGroupProps {
    form: FormInstance;
    hasCancelButton?: boolean;
    hasUpdateSaveButton?: boolean;
    hasCreateSubmitButton?: boolean;
    hasCreateSaveButton?: boolean;
    hasUpdateSubmitButton?: boolean;
    hasDeleteButton?: boolean;
    hasEditButton?: boolean;
    hasRejectButton?: boolean;
    hasApproveButton?: boolean;
    hasApproveDraftButton?: boolean;
    hasPublishButton?: boolean;
    hasUnpublishButton?: boolean;
    phoneInputRef?: React.RefObject<any>,
    emailInputRef?: React.RefObject<any>
}

export default function SchoolFormButton(
    {
        form,
        hasCancelButton,
        hasCreateSubmitButton,
        hasCreateSaveButton,
        hasUpdateSubmitButton,
        hasUpdateSaveButton,
        hasDeleteButton,
        hasEditButton,
        hasRejectButton,
        hasApproveButton,
        hasApproveDraftButton,
        hasPublishButton,
        hasUnpublishButton,
        phoneInputRef,
        emailInputRef
    }: ButtonGroupProps
) {
    const user = useSelector((state: RootState) => state.user);
    const role = user.role;
    if (role === ROLES.ADMIN) {
        return <SchoolFormButtonForAdmin
            form={form}
            hasCancelButton={hasCancelButton}
            hasCreateSubmitButton={hasCreateSubmitButton}
            hasCreateSaveButton={hasCreateSaveButton}
            hasUpdateSubmitButton={hasUpdateSubmitButton}
            hasUpdateSaveButton={hasUpdateSaveButton}
            hasDeleteButton={hasDeleteButton}
            hasEditButton={hasEditButton}
            hasRejectButton={hasRejectButton}
            hasApproveButton={hasApproveButton}
            hasApproveDraftButton={hasApproveDraftButton}
            hasPublishButton={hasPublishButton}
            hasUnpublishButton={hasUnpublishButton}
            emailInputRef={emailInputRef}
            phoneInputRef={phoneInputRef}
        />
    }
    if (role === ROLES.SCHOOL_OWNER) {
        return <SchoolFormButtonForSchoolOwner
            form={form}
            hasCancelButton={hasCancelButton}
            hasCreateSubmitButton={hasCreateSubmitButton}
            hasCreateSaveButton={hasCreateSaveButton}
            hasUpdateSubmitButton={hasUpdateSubmitButton}
            hasUpdateSaveButton={hasUpdateSaveButton}
            hasDeleteButton={hasDeleteButton}
            hasEditButton={hasEditButton}
            hasPublishButton={hasPublishButton}
            hasUnpublishButton={hasUnpublishButton}
            emailInputRef={emailInputRef}
            phoneInputRef={phoneInputRef}
        />
    }
}