import { FormInstance } from 'antd';

export const handleProvinceChange = (
    provinceCode: number,
    form: FormInstance,
    setSelectedProvince: (code: number | undefined) => void,
    setSelectedDistrict: (code: number | undefined) => void,
    setSelectedWard: (code: string | undefined) => void
) => {
    form.setFieldsValue({ district: undefined, ward: undefined, street: undefined });
    setSelectedProvince(provinceCode);
    setSelectedDistrict(undefined);
    setSelectedWard(undefined);
};

export const handleDistrictChange = (
    districtCode: number,
    form: FormInstance,
    setSelectedDistrict: (code: number | undefined) => void,
    setSelectedWard: (code: string | undefined) => void
) => {
    form.setFieldsValue({ ward: undefined, street: undefined });
    setSelectedDistrict(districtCode);
    setSelectedWard(undefined);
};

export const handleWardChange = (
    wardCode: string,
    setSelectedWard: (code: string | undefined) => void
) => {
    setSelectedWard(wardCode);
};