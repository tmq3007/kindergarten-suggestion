import { Checkbox, Col, Input, Row, Select, Slider } from "antd";
import React, { useState } from "react";
import {CHILD_RECEIVING_AGE_OPTIONS, FACILITY_OPTIONS, SCHOOL_TYPE_OPTIONS, UTILITY_OPTIONS} from "@/lib/constants";

export default function SchoolSearchHelper() {

    // Fee range
    const [feeRange, setFeeRange] = useState([10, 30]);

    const handleSliderChange = (value: number[]) => {
        setFeeRange(value);
    };

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const minValue = value.includes('millions')
            ? parseInt(value.replace(' millions', '').trim())
            : parseInt(value);
        if (!isNaN(minValue)) {
            setFeeRange([minValue, feeRange[1]]);
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const maxValue = value.includes('millions')
            ? parseInt(value.replace(' millions', '').trim())
            : parseInt(value);
        if (!isNaN(maxValue)) {
            setFeeRange([feeRange[0], maxValue]);
        }
    };

    // Facilities
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

    const handleFacilitiesChange = (checkedValues: string[]) => {
        setSelectedFacilities(checkedValues);
    };

    // Utilities
    const [selectedUtilities, setSelectedUtilities] = useState<string[]>([]);

    const handleUtilitiesChange = (checkedValues: string[]) => {
        setSelectedUtilities(checkedValues);
    };

    return (
        <div>
            <h1 className={'text-center text-lg'}>Refine your search</h1>

            <h1>Type of schools</h1>
            <Select
                className={'w-full'}
                defaultValue="0"
                options={SCHOOL_TYPE_OPTIONS}
            />

            <h1>Admission age (from)</h1>
            <Select
                className={'w-full'}
                defaultValue="0"
                options={CHILD_RECEIVING_AGE_OPTIONS}
            />

            <h1>Monthly fee (VND/month)</h1>
            <Slider
                range
                min={0}
                max={50}
                value={feeRange}
                onChange={handleSliderChange}
            />
            <Row gutter={16}>
                <Col className="gutter-row bg-custom-100" span={12}>
                    <span>Min</span>
                    <Input
                        value={`${feeRange[0]} millions`}
                        onChange={handleMinChange}
                    />
                </Col>
                <Col className="gutter-row" span={12}>
                    <span>Max</span>
                    <Input
                        value={`${feeRange[1]} millions`}
                        onChange={handleMaxChange}
                    />
                </Col>
            </Row>

            <h1>Facilities</h1>
            <Checkbox.Group
                className={'flex flex-col gap-2'}
                options={FACILITY_OPTIONS}
                onChange={handleFacilitiesChange}
                value={selectedFacilities}
            />

            <h1>Utilities</h1>
            <Checkbox.Group
                className={'flex flex-col gap-2'}
                options={UTILITY_OPTIONS}
                onChange={handleUtilitiesChange}
                value={selectedUtilities}
            />
        </div>
    );
}