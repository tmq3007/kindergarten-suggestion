'use client';

import { Select } from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';
import Form2 from '@/app/components/school/Form2';

const { Option } = Select;
const page = () => {
    return (
        <>
            <div className='bg-white'>
                <h2 className="ml-4 text-2xl font-bold m-3">Add new school</h2>
                <Form2 hasSaveDraftButton={true} hasSubmitButton={true} />
            </div>
        </>
    );
}

export default page;