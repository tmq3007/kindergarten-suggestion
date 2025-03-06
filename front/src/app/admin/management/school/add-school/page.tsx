'use client';

import { Select } from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';
import Form2 from '@/app/components/school/Form2';

const { Option } = Select;
const page = () => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-6">Add new school</h2>
            <Form2  hasSaveDraftButton={true} hasSubmitButton={true}/>
        </>
    );
}

export default page;