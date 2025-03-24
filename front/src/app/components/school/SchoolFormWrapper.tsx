import {SCHOOL_STATUS} from "@/lib/constants";
import SchoolForm from "@/app/components/school/SchoolForm";
import React from "react";
import {FormInstance} from "antd/es/form";
import {SchoolDetailVO, SchoolVO} from "@/redux/services/schoolApi";

interface SchoolFormWrapperProps {
    form: FormInstance;
    school: SchoolVO | SchoolDetailVO;
    isEdit?: boolean;
    isDetailPage?: boolean;
}

export default function SchoolFormWrapper({form, school, isEdit, isDetailPage}: SchoolFormWrapperProps) {
    return (
        <SchoolForm
            isDetailPage={isDetailPage}
            isEdit={isEdit}
            isReadOnly={true}
            form={form}
            hideImageUpload={true}
            imageList={school.imageList || []}
            hasCancelButton={false}
            hasDeleteButton={
                school.status === SCHOOL_STATUS.Submitted ||
                school.status === SCHOOL_STATUS.Published ||
                school.status === SCHOOL_STATUS.Unpublished
            }
            hasEditButton={true}
            hasRejectButton={school.status === SCHOOL_STATUS.Submitted}
            hasApproveButton={school.status === SCHOOL_STATUS.Submitted}
            hasApproveDraftButton={school.status === SCHOOL_STATUS.Submitted}
            hasPublishButton={
                school.status === SCHOOL_STATUS.Approved ||
                school.status === SCHOOL_STATUS.Unpublished
            }
            hasUnpublishButton={school.status === SCHOOL_STATUS.Published}
        />
    )
}