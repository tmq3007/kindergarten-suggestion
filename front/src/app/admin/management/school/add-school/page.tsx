'use client';

import { Select } from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';

const { Option } = Select;
const page = () => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-6">Add new school</h2>
            <SchoolForm  hasSaveDraftButton={true} hasSubmitButton={true}/>
        </>
    );
}

export default page;