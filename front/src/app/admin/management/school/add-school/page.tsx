'use client';

import { Form, Input, Select, Checkbox, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import SchoolForm from '@/app/components/AddSchool';

const { Option } = Select;
const page = () => {
    return (
        <>
            <SchoolForm />
        </>
    );
}

export default page;