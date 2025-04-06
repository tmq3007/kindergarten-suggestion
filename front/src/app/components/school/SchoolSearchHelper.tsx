'use client'
import {Checkbox, Col, Input, Row, Select, Slider} from "antd";
import React from "react";
import {CHILD_RECEIVING_AGE_OPTIONS, FACILITY_OPTIONS, SCHOOL_TYPE_OPTIONS, UTILITY_OPTIONS} from "@/lib/constants";
import {SchoolSearchDTO} from "@/redux/services/schoolApi";

interface SchoolSearchHelperProps {
    searchParams: SchoolSearchDTO;
    onApplyFiltersAction: (updatedParams: SchoolSearchDTO) => void;
    isLoading?: boolean;
}

export default function SchoolSearchHelper({ searchParams, onApplyFiltersAction, isLoading }: SchoolSearchHelperProps) {
    // Handler for school type filter
    const handleSchoolTypeChange = (value: number | null) => {
        onApplyFiltersAction({
            ...searchParams,
            type: value ?? undefined,
            page: 0
        });
    };

    // Handler for age filter
    const handleAgeChange = (value: number | null) => {
        onApplyFiltersAction({
            ...searchParams,
            age: value ?? undefined,
            page: 0
        });
    };

    // Handler for fee range filter
    const handleFeeRangeChange = (value: number[]) => {
        onApplyFiltersAction({
            ...searchParams,
            minFee: value[0] * 1000000, // Convert to VND
            maxFee: value[1] * 1000000, // Convert to VND
            page: 0,
        });
    };

    // Handler for facilities filter
    const handleFacilitiesChange = (checkedValues: number[]) => {
        onApplyFiltersAction({
            ...searchParams,
            facilityIds: checkedValues.length > 0 ? checkedValues : undefined,
            page: 0,
        });
    };

    // Handler for utilities filter
    const handleUtilitiesChange = (checkedValues: number[]) => {
        onApplyFiltersAction({
            ...searchParams,
            utilityIds: checkedValues.length > 0 ? checkedValues : undefined,
            page: 0,
        });
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}