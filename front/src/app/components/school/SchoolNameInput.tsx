// SchoolNameInput.tsx
import React, {useEffect, useState} from 'react';
import {AutoComplete, Form, Input, Select} from 'antd';
import {ExpectedSchool, useSearchExpectedSchoolQuery} from '@/redux/services/schoolApi';
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";

interface SchoolNameInputProps {
    isReadOnly?: boolean;
    form: any;
    isEdit?: boolean;
    onSchoolOptionsChange?: (options: { value: string, BRN?: string }[]) => void;
}

const SchoolNameInput: React.FC<SchoolNameInputProps> = ({
                                                             isReadOnly,
                                                             form,
                                                             isEdit,
                                                             onSchoolOptionsChange
                                                         }) => {
    const [schoolOptions, setSchoolOptions] = useState<{
        label: React.ReactNode;
        value: string;
        BRN?: string;
        key: string;
    }[]>([]);
    const user = useSelector((state: RootState) => state.user);

    const {
        data: expectedSchoolData,
        isLoading: isLoadingExpectedSchool,
    } = useSearchExpectedSchoolQuery({id: Number(user.id)});


    useEffect(() => {
        if (expectedSchoolData?.data) {
            const options = expectedSchoolData.data.map((expectedSchool: ExpectedSchool, index: number) => ({
                label: (
                    <div>
                        <span>{expectedSchool.expectedSchool}</span>
                        {expectedSchool.BRN && (
                            <span className="ml-2 text-gray-500">({expectedSchool.BRN})</span>
                        )}
                    </div>
                ),
                value: expectedSchool.expectedSchool,
                BRN: expectedSchool.BRN,
                key: expectedSchool.BRN
                    ? `${expectedSchool.expectedSchool}-${expectedSchool.BRN}`
                    : `${expectedSchool.expectedSchool}-${index}`
            }));
            setSchoolOptions(options);
            if (onSchoolOptionsChange) {
                onSchoolOptionsChange(options.map(opt => ({value: opt.value, BRN: opt.BRN})));
            }
        }
    }, [expectedSchoolData]);

    return (
        <Form.Item
            tooltip="This must match the expected school when creating School Owner account"
            name="name"
            label="School Name"
            rules={[{required: true, message: 'Please enter school name'}]}
        >
            {isEdit ? (
                <AutoComplete
                    options={schoolOptions}
                    disabled={isReadOnly}
                    placeholder="Enter school name..."
                    filterOption={(inputValue, option) =>
                        option && option.value
                            ? option.value.toLowerCase().includes(inputValue.toLowerCase())
                            : false
                    }
                >
                    <Input placeholder="Enter school name..."/>
                </AutoComplete>
            ) : (
                <Select
                    showSearch
                    placeholder="Search and select a school..."
                    options={schoolOptions}
                    loading={isLoadingExpectedSchool}
                    filterOption={(input, option) =>
                        !!(option && option.value.toLowerCase().includes(input.toLowerCase()))
                    }
                    disabled={isReadOnly}
                />
            )}
        </Form.Item>
    );
};

export default SchoolNameInput;