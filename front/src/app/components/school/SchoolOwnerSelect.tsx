'use client';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Form, Select} from 'antd';
import {MailOutlined, PhoneOutlined, UserOutlined} from '@ant-design/icons';
import {useSelector} from 'react-redux';
import {RootState} from '@/redux/store';
import {SchoolOwnerVO} from '@/redux/services/schoolOwnerApi';
import {useLazySearchSchoolOwnersForAddSchoolQuery} from '@/redux/services/schoolApi';

interface SchoolOwnersSelectProps {
    form: any;
    isReadOnly?: boolean;
    schoolNameValue?: string;
    BRN?: string;
    initialOwners?: SchoolOwnerVO[];
    onSchoolOptionsChange?: (options: { value: string; BRN?: string }[]) => void;
}

const SchoolOwnersSelect: React.FC<SchoolOwnersSelectProps> = ({
                                                                   form,
                                                                   isReadOnly,
                                                                   schoolNameValue,
                                                                   BRN,
                                                                   initialOwners = [],
                                                               }) => {
    const user = useSelector((state: RootState) => state.user);
    const [triggerSearchSchoolOwners, searchSchoolOwnersResult] = useLazySearchSchoolOwnersForAddSchoolQuery();
    const [fetchedOwners, setFetchedOwners] = useState<SchoolOwnerVO[]>([]);
    const [ownerOptions, setOwnerOptions] = useState<
        { label: React.ReactNode; value: string; owner: SchoolOwnerVO }[]
    >([]);
    const [initialSelectionDone, setInitialSelectionDone] = useState(false);

    // Custom render for owner options
    const renderOwnerOption = (owner: SchoolOwnerVO) => (
        <div className="py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center text-sm">
                <UserOutlined className="mr-2 text-blue-500"/>
                <span className="font-medium text-gray-800">{owner.fullname}</span>
                <span className="ml-2 text-gray-500">(@{owner.username})</span>
            </div>
            <div className="flex items-center text-xs text-gray-600 mt-1 ml-6">
                <MailOutlined className="mr-2 text-gray-400"/>
                {owner.email}
            </div>
            <div className="flex items-center text-xs text-gray-600 mt-1 ml-6">
                <PhoneOutlined className="mr-2 text-gray-400"/>
                {owner.phone}
            </div>
        </div>
    );

    // Custom render for selected tags
    const renderOwnerTag = (props: any) => {
        const {value, closable, onClose} = props;
        const owner = ownerOptions.find((opt) => opt.value === value)?.owner;
        const isCurrentUser = owner?.userId === Number(user.id);

        return (
            <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                <UserOutlined className="text-blue-500 mr-1"/>
                <span>
                    {owner?.username || 'Unknown'} {isCurrentUser && '(You)'}
                </span>
                {!isCurrentUser && closable && (
                    <span
                        className="ml-1 cursor-pointer text-gray-500 hover:text-red-500"
                        onClick={onClose}
                    >
                        ×
                    </span>
                )}
            </div>
        );
    };

    // Fetch owners when school name or BRN changes
    const fetchOwners = async () => {
        if (!schoolNameValue || isReadOnly) {
            setFetchedOwners([]);
            return;
        }
        try {
            const result = await triggerSearchSchoolOwners({expectedSchool: schoolNameValue, BRN}).unwrap();
            setFetchedOwners(result?.data || []);
        } catch (error) {
            console.error('Error fetching school owners:', error);
            setFetchedOwners([]);
        }
    };

    // Combine initialOwners (fixed) and fetchedOwners
    const combinedOptions = useMemo(() => {
        const allOwners = [...initialOwners];
        fetchedOwners.forEach((fetchedOwner) => {
            if (!allOwners.some((owner) => owner.id === fetchedOwner.id)) {
                allOwners.push(fetchedOwner);
            }
        });
        return allOwners.map((owner) => ({
            label: renderOwnerOption(owner),
            value: String(owner.id),
            owner,
        }));
    }, [fetchedOwners, initialOwners]);

    // Update options and handle initial auto-selection or deselection
    const hasSetOwnersRef = useRef(false);

    useEffect(() => {
        if (isReadOnly || hasSetOwnersRef.current) return;

        setOwnerOptions(combinedOptions);

        const currentOwners = form.getFieldValue('schoolOwners') || [];
        const updated = new Set(currentOwners);

        const userOwnerId = combinedOptions.find((opt) => opt.owner.userId === Number(user.id))?.value;
        if (userOwnerId) updated.add(userOwnerId);

        initialOwners.forEach((owner) => updated.add(String(owner.id)));

        const updatedArray = Array.from(updated);

        if (
            currentOwners.length !== updatedArray.length ||
            !currentOwners.every((id: number) => updated.has(id))
        ) {
            form.setFieldsValue({schoolOwners: updatedArray});
            hasSetOwnersRef.current = true;
        }
    }, [combinedOptions, isReadOnly, user.id, initialOwners]);


    // Fetch owners when schoolNameValue or BRN changes
    useEffect(() => {
        fetchOwners().then(() => {
        });
    }, [schoolNameValue, BRN, isReadOnly]);

    // Handle owners selection change
    const handleOwnersChange = (selectedOwners: string[]) => {
        const userOwnerId = ownerOptions.find((opt) => opt.owner.userId === Number(user.id))?.value;
        if (userOwnerId && !selectedOwners.includes(userOwnerId)) {
            form.setFieldsValue({schoolOwners: [...selectedOwners, userOwnerId]});
        } else {
            form.setFieldsValue({schoolOwners: selectedOwners});
        }
    };

    return (
        <Form.Item name="schoolOwners" label="School Owners">
            <Select
                showSearch
                mode="multiple"
                placeholder="Select school owners..."
                options={ownerOptions}
                onChange={handleOwnersChange}
                loading={searchSchoolOwnersResult.isFetching}
                disabled={isReadOnly || !schoolNameValue}
                tagRender={renderOwnerTag}
                filterOption={(input, option) => {
                    const owner = (option as any)?.owner as SchoolOwnerVO;
                    return (
                        owner &&
                        (owner.fullname.toLowerCase().includes(input.toLowerCase()) ||
                            owner.username.toLowerCase().includes(input.toLowerCase()) ||
                            owner.email.toLowerCase().includes(input.toLowerCase()) ||
                            owner.phone.toLowerCase().includes(input.toLowerCase()))
                    );
                }}
                dropdownStyle={{minWidth: 300}}
                notFoundContent={
                    searchSchoolOwnersResult.isFetching
                        ? 'Loading...'
                        : schoolNameValue
                            ? 'No owners found'
                            : 'Please select a school first'
                }
            />
        </Form.Item>
    );
};

export default SchoolOwnersSelect;