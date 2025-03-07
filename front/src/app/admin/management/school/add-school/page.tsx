'use client';

import {Select} from 'antd';
import SchoolForm from '@/app/components/school/SchoolForm';
import {h2} from 'framer-motion/client';

const { Option } = Select;
const page = () => {
    return (
        <>
            <div className='bg-white'>
                <h2 className="ml-4 text-2xl font-bold m-3">Add new school</h2>
                <SchoolForm hasSaveDraftButton={true} hasSubmitButton={true} />
            </div>
        </>
    );
}

export default page;