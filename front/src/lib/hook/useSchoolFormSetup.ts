import {useEffect} from "react";
import {FormInstance} from "antd";
import {formatPhoneNumber} from "@/lib/util/phoneUtils";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
} from "@/lib/constants";
import {SchoolVO} from "@/redux/services/schoolApi";

export const useSchoolFormSetup = (school: SchoolVO | undefined, form: FormInstance) => {
    useEffect(() => {
        if (school) {
            console.log("school.imageList in SchoolDetail:", school.imageList);

            const validEducationMethod =
                EDUCATION_METHOD_OPTIONS.find(
                    (opt) => opt.value === String(school.educationMethod)
                )?.value || "0";
            const validReceivingAge =
                CHILD_RECEIVING_AGE_OPTIONS.find(
                    (opt) => opt.value === String(school.receivingAge)
                )?.value || "0";

            form.setFieldsValue({
                name: school.name || "",
                schoolType: school.schoolType != null ? String(school.schoolType) : "0",
                province: school.province || "",
                district: school.district || "",
                ward: school.ward || "",
                street: school.street || "",
                email: school.email || "",
                phone: formatPhoneNumber(school.phone),
                website: school.website || "",
                receivingAge: validReceivingAge,
                educationMethod: validEducationMethod,
                feeFrom: school.feeFrom || 0,
                feeTo: school.feeTo || 0,
                description: school.description || "",
                status: school.status || 0,
            });

            const facilityValues: string[] =
                school.facilities?.map((facility) => String(facility.fid)) || [];
            form.setFieldsValue({facilities: facilityValues});

            const utilityValues: string[] =
                school.utilities?.map((utility) => String(utility.uid)) || [];
            form.setFieldsValue({utilities: utilityValues});
        }
    }, [school, form]);
};
