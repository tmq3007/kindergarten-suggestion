// SearchComponent.tsx
import React, { useState } from "react";
import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type {SizeType} from "antd/es/config-provider/SizeContext";

interface SearchCriteria {
    searchBy: string;
    keyword: string | undefined;
}

interface SearchOption {
    value: string;
    label: string;
}

interface SearchComponentProps {
    onSearch: (criteria: SearchCriteria) => void;
    options: SearchOption[];
    initialSearchBy?: string;
    size?: SizeType;
}

const SearchByComponent: React.FC<SearchComponentProps> = ({
                                                               onSearch,
                                                               options,
                                                               initialSearchBy,
                                                               size = "large"
                                                           }) => {
    const [searchCriteria, setSearchCriteria] = useState({
        searchBy: initialSearchBy || options[0]?.value || "",
        keyword: undefined as string | undefined,
    });

    const handleSearch = (value: string) => {
        const newCriteria = {
            ...searchCriteria,
            keyword: value.trim() || undefined,
        };
        setSearchCriteria(newCriteria);
        onSearch(newCriteria);
    };

    const handleSearchFieldChange = (value: string) => {
        setSearchCriteria(prev => ({
            ...prev,
            searchBy: value,
        }));
    };

    return (
        <div className="flex flex-col sm:flex-row w-full">
            <Space.Compact className="w-full flex" size={size}>
                <Select
                    value={searchCriteria.searchBy}
                    onChange={handleSearchFieldChange}
                    popupMatchSelectWidth={false}
                >
                    {options.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                            {option.label}
                        </Select.Option>
                    ))}
                </Select>
                <Input.Search
                    placeholder={`Search by ${searchCriteria.searchBy}`}
                    onSearch={handleSearch}
                    enterButton={<SearchOutlined />}
                    allowClear
                    className="flex-1" //
                />
            </Space.Compact>
        </div>
    );
};

export default SearchByComponent;