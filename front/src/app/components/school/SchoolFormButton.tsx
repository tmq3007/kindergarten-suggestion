import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ROLES } from "@/lib/constants";
import SchoolFormButtonForAdmin from "@/app/components/school/SchoolFormButtonForAdmin";
import { FormInstance } from "antd/es/form";
import SchoolFormButtonForSchoolOwner from "@/app/components/school/SchoolFormButtonForSchoolOwner";
import { Country } from "@/redux/services/types";

export interface ButtonGroupProps {
    form: FormInstance;
    hasCancelButton?: boolean;
    hasSaveButton?: boolean;
    hasCreateSubmitButton?: boolean;
    hasUpdateSubmitButton?: boolean;
    hasDeleteButton?: boolean;
    hasEditButton?: boolean;
    hasRejectButton?: boolean;
    hasApproveButton?: boolean;
    hasPublishButton?: boolean;
    hasUnpublishButton?: boolean;
    phoneInputRef?: React.RefObject<any>,
    emailInputRef?: React.RefObject<any>
}

export default function SchoolFormButton(
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
            hasSaveButton={hasSaveButton}
            hasCreateSubmitButton={hasCreateSubmitButton}
            hasUpdateSubmitButton={hasUpdateSubmitButton}
            hasDeleteButton={hasDeleteButton}
            hasEditButton={hasEditButton}
            hasRejectButton={hasRejectButton}
            hasApproveButton={hasApproveButton}
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
            hasSaveButton={hasSaveButton}
            hasCreateSubmitButton={hasCreateSubmitButton}
            hasUpdateSubmitButton={hasUpdateSubmitButton}
            hasDeleteButton={hasDeleteButton}
            hasEditButton={hasEditButton}
            hasPublishButton={hasPublishButton}
            hasUnpublishButton={hasUnpublishButton}
            emailInputRef={emailInputRef}
            phoneInputRef={phoneInputRef}
        />
    }
}