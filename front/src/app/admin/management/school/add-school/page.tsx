'use client';

import { Image, Select } from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';
import Form2 from '@/app/components/school/Form2';
import { h2 } from 'framer-motion/client';

const { Option } = Select;
const page = () => {
    return (
        <>
            <div className='bg-white rounded-lg'>
                <h2 className="ml-4 text-2xl font-bold ">Add new school</h2>
                <Form2 hasSaveDraftButton={true} hasSubmitButton={true} />
            </div>
        </>
    );
}

export default page;