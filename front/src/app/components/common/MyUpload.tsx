import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';

const { Dragger } = Upload;

const props: UploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
        const { status } = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`).then(null);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`).then(null);
        }
    },
    onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
    },
};

export default function MyUpload () {
   return(
       <Dragger {...props}>
           <p className="ant-upload-drag-icon">
               <InboxOutlined/>
           </p>
           <p className="ant-upload-text"><span className={'text-blue-600'}>Upload a file</span> or drag and drop</p>
           <p className="ant-upload-hint">
               PNG, JPG, GIF up to 5MB
           </p>
       </Dragger>
   )
}

