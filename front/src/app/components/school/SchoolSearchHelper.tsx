'use client'
import { Checkbox, Col, Input, Row, Select, Slider } from "antd";
import React from "react";
import { useRouter } from "next/navigation";
import { CHILD_RECEIVING_AGE_OPTIONS, FACILITY_OPTIONS, SCHOOL_TYPE_OPTIONS, UTILITY_OPTIONS } from "@/lib/constants";
import { SchoolSearchDTO } from "@/redux/services/schoolApi";
// v4
interface SchoolSearchHelperProps {
    searchParams: SchoolSearchDTO;
    onApplyFiltersAction: (updatedParams: SchoolSearchDTO) => void;
}

export default function SchoolSearchHelper({ searchParams, onApplyFiltersAction }: SchoolSearchHelperProps) {
    const router = useRouter();

    // Function to update URL immediately based on search parameters
    const updateURL = (params: SchoolSearchDTO) => {
        const urlParams = new URLSearchParams();
        if (params.name) urlParams.set('name', params.name);
        if (params.province) urlParams.set('province', params.province);
        if (params.district) urlParams.set('district', params.district);
        if (params.type) urlParams.set('type', params.type.toString());
        if (params.age) urlParams.set('age', params.age.toString());
        if (params.minFee) urlParams.set('minFee', params.minFee.toString());
        if (params.maxFee) urlParams.set('maxFee', params.maxFee.toString());
        if (params.facilityIds?.length) urlParams.set('facilityIds', params.facilityIds.join(','));
        if (params.utilityIds?.length) urlParams.set('utilityIds', params.utilityIds.join(','));
        urlParams.set('page', (params.page + 1).toString());
        urlParams.set('size', params.size.toString());
        urlParams.set('sortBy', params.sortBy);

        console.log('Updating URL in SchoolSearchHelper:', urlParams.toString());
        router.replace(`?${urlParams.toString()}`, { scroll: false });
    };

    // Handle school type change and update URL immediately
    const handleSchoolTypeChange = (value: number | null) => {
        const updatedParams = { ...searchParams, type: value ?? undefined, page: 0 };
        updateURL(updatedParams); // Update URL immediately
        onApplyFiltersAction(updatedParams); // Notify parent component
    };

    // Handle age change and update URL immediately
    const handleAgeChange = (value: number | null) => {
        const updatedParams = { ...searchParams, age: value ?? undefined, page: 0 };
        updateURL(updatedParams); // Update URL immediately
        onApplyFiltersAction(updatedParams); // Notify parent component
    };

    // Handle fee range change and update URL immediately
    const handleFeeRangeChange = (value: number[]) => {
        const updatedParams = {
            ...searchParams,
            minFee: value[0] * 1000000, // Convert to VND
            maxFee: value[1] * 1000000, // Convert to VND
            page: 0,
        };
        updateURL(updatedParams); // Update URL immediately
        onApplyFiltersAction(updatedParams); // Notify parent component
    };

    // Handle facilities change and update URL immediately
    const handleFacilitiesChange = (checkedValues: number[]) => {
        const updatedParams = {
            ...searchParams, // Giữ nguyên các tham số khác như province
            facilityIds: checkedValues.length > 0 ? checkedValues : undefined, // Chỉ cập nhật facilityIds
            page: 0,
        };
        updateURL(updatedParams);
        onApplyFiltersAction(updatedParams);
    };

    // Handle utilities change and update URL immediately
    const handleUtilitiesChange = (checkedValues: number[]) => {
        const updatedParams = {
            ...searchParams, // Giữ nguyên các tham số khác như province
            utilityIds: checkedValues.length > 0 ? checkedValues : undefined, // Chỉ cập nhật utilityIds
            page: 0,
        };
        updateURL(updatedParams);
        onApplyFiltersAction(updatedParams);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-center py-4 border-b">Refine Your Search</h1>

            {/* School Type Filter */}
            <div className="space-y-2">
                <h2 className="font-medium">Type of schools</h2>
                <Select
                    className="w-full"
                    placeholder="Select school type"
                    options={SCHOOL_TYPE_OPTIONS}
                    onChange={handleSchoolTypeChange}
                    allowClear
                    value={searchParams.type}
                />
            </div>

            {/* Age Filter */}
            <div className="space-y-2">
                <h2 className="font-medium">Admission age (from)</h2>
                <Select
                    className="w-full"
                    placeholder="Select age"
                    options={CHILD_RECEIVING_AGE_OPTIONS}
                    onChange={handleAgeChange}
                    allowClear
                    value={searchParams.age}
                />
            </div>

            {/* Fee Range Filter */}
            <div className="space-y-2">
                <h2 className="font-medium">Monthly fee (VND/month)</h2>
                <Slider
                    range
                    min={0}
                    max={100}
                    value={[
                        searchParams.minFee ? searchParams.minFee / 1000000 : 0,
                        searchParams.maxFee ? searchParams.maxFee / 1000000 : 100,
                    ]}
                    onChange={handleFeeRangeChange}
                    tooltip={{ formatter: (value) => `${value} millions` }}
                />
                <Row gutter={16} className="mt-2">
                    <Col span={12}>
                        <Input
                            value={`${searchParams.minFee ? searchParams.minFee / 1000000 : 0} millions`}
                            readOnly
                        />
                    </Col>
                    <Col span={12}>
                        <Input
                            value={`${searchParams.maxFee ? searchParams.maxFee / 1000000 : 100} millions`}
                            readOnly
                        />
                    </Col>
                </Row>
            </div>

            {/* Facilities Filter */}
            <div className="space-y-2">
                <h2 className="font-medium">Facilities</h2>
                <Checkbox.Group
                    className="flex flex-col gap-2"
                    options={FACILITY_OPTIONS.map(opt => ({
                        label: opt.label,
                        value: Number(opt.value),
                    }))}
                    onChange={handleFacilitiesChange}
                    value={searchParams.facilityIds}
                />
            </div>

            {/* Utilities Filter */}
            <div className="space-y-2">
                <h2 className="font-medium">Utilities</h2>
                <Checkbox.Group
                    className="flex flex-col gap-2"
                    options={UTILITY_OPTIONS.map(opt => ({
                        label: opt.label,
                        value: Number(opt.value),
                    }))}
                    onChange={handleUtilitiesChange}
                    value={searchParams.utilityIds}
                />
            </div>
        </div>
    );
}