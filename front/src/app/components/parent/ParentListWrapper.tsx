import React, {memo, useCallback, useMemo, useState} from 'react';
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SearchByComponent from "@/app/components/common/SearchByComponent";
import ParentList from "@/app/components/parent/ParentList";
import {Card, Select, Dropdown, Space, Checkbox} from "antd";
import {SettingOutlined} from '@ant-design/icons';
import type {MenuProps} from 'antd';

interface ParentListWrapperProps {
    useQueryTrigger: any;
    searchOptions: { label: string, value: string }[];
    title?: string;
    isEnrollPage?: boolean;
    isAdminPage?: boolean;
}

const statusOptions = [
    {label: "All Status", value: null},
    {label: "Active", value: true},
    {label: "Inactive", value: false},
];

const ParentListWrapper: React.FC<ParentListWrapperProps> = ({
                                                                 useQueryTrigger,
                                                                 searchOptions,
                                                                 isEnrollPage = false,
                                                                 isAdminPage = false,
                                                                 title = ""
                                                             }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(15);
    const [searchCriteria, setSearchCriteria] = useState({
        searchBy: searchOptions[0].value,
        keyword: undefined as string | undefined,
    });
    const [showInactive, setShowInactive] = useState<true | false | null>(true);

    // State for skip confirmations
    const [skipConfirmations, setSkipConfirmations] = useState({
        approve: localStorage.getItem('skipApproveConfirmation') === 'true',
        reject: localStorage.getItem('skipRejectConfirmation') === 'true',
        unEnroll: localStorage.getItem('skipUnEnrollConfirmation') === 'true',
    });

    const {
        data,
        isLoading,
        isFetching,
        error
    } = useQueryTrigger({
        page: currentPage,
        size: currentPageSize,
        ...searchCriteria,
        ...(showInactive !== null && {status: showInactive})
    });

    const fetchPage = useCallback((page: number, size: number) => {
        setCurrentPage(page);
        setCurrentPageSize(size);
    }, []);

    const handleSearch = useCallback(
        (criteria: { searchBy: string; keyword: string | undefined }) => {
            setSearchCriteria(criteria);
            setCurrentPage(1);
        },
        []
    );

    // Function to update skipConfirmations
    const updateSkipConfirmation = useCallback((action: "approve" | "reject" | "unEnroll", value: boolean) => {
        setSkipConfirmations((prev) => ({
            ...prev,
            [action]: value,
        }));
        localStorage.setItem(`skip${action.charAt(0).toUpperCase() + action.slice(1)}Confirmation`, value.toString());
    }, []);

    // Function to toggle confirmation back on (reset "Do not ask again")
    const toggleConfirmation = useCallback((action: "approve" | "reject" | "unEnroll") => (checked: boolean) => {
            updateSkipConfirmation(action, !checked);
    }, [updateSkipConfirmation]);

    // Define menu items for the dropdown
    const items: MenuProps['items'] = useMemo(() => [
        {
            key: 'approve',
            label: (
                <Checkbox
                    checked={!skipConfirmations.approve}
                    onChange={(e) => toggleConfirmation("approve")(e.target.checked)}
                    onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                >
                    Ask before Approve
                </Checkbox>
            ),
        },
        {
            key: 'reject',
            label: (
                <Checkbox
                    checked={!skipConfirmations.reject}
                    onChange={(e) => toggleConfirmation("reject")(e.target.checked)}
                    onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                >
                    Ask before Reject
                </Checkbox>
            ),
        },
        ...(isEnrollPage ? [] : [{
            key: 'unenroll',
            label: (
                <Checkbox
                    checked={!skipConfirmations.unEnroll}
                    onChange={(e) => toggleConfirmation("unEnroll")(e.target.checked)}
                    onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                >
                    Ask before Unenroll
                </Checkbox>
            ),
        }]),
    ], [toggleConfirmation, isEnrollPage, skipConfirmations.approve, skipConfirmations.reject, skipConfirmations.unEnroll]);

    return (
        <Card
            title={
                <div className="flex flex-col md:flex-row items-start md:items-center text-wrap justify-between">
                    <SchoolManageTitle title={title}/>
                    <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                        <div className="w-full">
                            <SearchByComponent
                                onSearch={handleSearch}
                                options={searchOptions}
                                initialSearchBy={searchOptions[0].value}
                            />
                        </div>
                        {isAdminPage && (
                            <Select
                                value={showInactive}
                                onChange={(value) => setShowInactive(value)}
                                className="w-40"
                                options={statusOptions}
                            />
                        )}
                        {!isAdminPage && (
                            <Dropdown menu={{items}} trigger={['click']} placement={"bottomRight"} arrow>
                                <a onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <SettingOutlined/>
                                    </Space>
                                </a>
                            </Dropdown>)}
                    </div>
                </div>
            }
        >
            <div className="mt-4">
                <ParentList
                    isAdminPage={isAdminPage}
                    isEnrollPage={isEnrollPage}
                    fetchPage={fetchPage}
                    data={data}
                    error={error}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    skipConfirmations={skipConfirmations}
                    updateSkipConfirmation={updateSkipConfirmation}
                />
            </div>
        </Card>
    );
};

export default memo(ParentListWrapper);