import React, {useEffect, useRef, useState} from 'react';
import {Upload, UploadFile, UploadProps, notification, Image, FormInstance} from 'antd';
import {InboxOutlined, PlusOutlined} from '@ant-design/icons';
import 'antd/dist/reset.css';
import ImgCrop from "antd-img-crop";

interface ImageUploadProps {
    form: FormInstance;
    fieldName: string;
    maxCount?: number;
    accept?: string | string[];
    maxSizeMB?: number;
    hideImageUpload?: boolean;
    imageList?: { url: string; filename: string }[];
    formLoaded?: boolean;
}

const uploadButton = (
    <button style={{border: 0, background: 'none'}} type="button">
        <PlusOutlined/>
        <div style={{marginTop: 8}}>Upload</div>
    </button>
);

export const ImageUpload: React.FC<ImageUploadProps> = ({
                                                            form,
                                                            fieldName,
                                                            maxCount = 10,
                                                            accept,
                                                            maxSizeMB = 5,
                                                            hideImageUpload = false,
                                                            imageList = [],
                                                            formLoaded = false,
                                                        }) => {
    const [fileList, setFileList] = useState<UploadFile[]>(form.getFieldValue(fieldName) || []);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [noti, notificationContextHolder] = notification.useNotification();

    // Format for Upload component (technical MIME types)
    const formattedAccept = accept
        ? Array.isArray(accept)
            ? accept.join(',')
            : accept
        : '*/*';

    // Format for display (user-friendly extensions)
    const displayAccept = accept
        ? Array.isArray(accept)
            ? accept.map(type => {
                const extension = type.split('/')[1]?.toUpperCase();
                return extension === 'JPEG' ? 'JPG' : extension; // Normalize JPEG to JPG
            }).join(', ')
            : accept.split('/')[1]?.toUpperCase() || accept
        : 'any type';


    useEffect(() => {
        console.log('ImageUpload useEffect, formLoaded:', formLoaded);
        if (formLoaded) {
            const currentFiles = form.getFieldValue(fieldName) || [];

            const formattedFiles: UploadFile[] = currentFiles.map((file: any) => ({
                uid: file.cloudId || file.uid || `${Math.random()}`,
                name: file.filename || file.name || `Image-${file.cloudId || file.uid || Math.random()}`,
                status: 'done',
                url: file.url,
            }));

            setFileList(formattedFiles);
        }
    }, [formLoaded]);

    const getBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({fileList: newFileList}) => {
        setFileList(newFileList);
        form.setFieldsValue({[fieldName]: newFileList});
    };

    const beforeUpload = (file: File) => {
        const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB;
        if (!isLtMaxSize) {
            noti.error({
                message: 'File too large',
                description: `File must be smaller than ${maxSizeMB}MB!`,
            });
            return Upload.LIST_IGNORE;
        }
        // If accept is not specified, allow all files
        if (!accept) {
            return true;
        }

        // Check file type against accept prop
        const fileType = file.type; // MIME type (e.g., "image/jpeg")
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const allowedTypes = Array.isArray(accept) ? accept : [accept];

        // Convert allowed MIME types to extensions for comparison
        const allowedExtensions = allowedTypes.map(type => {
            const ext = type.split('/')[1]?.toLowerCase();
            return ext === 'jpeg' ? 'jpg' : ext; // Normalize "jpeg" to "jpg"
        });

        // Check if the file's MIME type or extension is allowed
        const isValidType = allowedTypes.includes(fileType) ||
            (fileExtension && allowedExtensions.includes(fileExtension));

        if (!isValidType) {
            noti.error({
                message: 'Invalid file type',
                description: `Only ${displayAccept} files are allowed!`,
            });
            return Upload.LIST_IGNORE;
        }

        return false;
    };

    return (
        <>
            {notificationContextHolder}
            {hideImageUpload ? (
                <div className="grid grid-cols-3 gap-4">
                    {imageList.length > 0 ? (
                        <Image.PreviewGroup>
                            {imageList.map((image, index) => (
                                <Image
                                    key={index}
                                    src={image.url}
                                    alt={image.filename}
                                    width={100}
                                    height={100}
                                    className="object-cover rounded-md"
                                    preview={{mask: "View"}}
                                />
                            ))}
                        </Image.PreviewGroup>
                    ) : (
                        <p>No images available</p>
                    )}
                </div>
            ) : (
                <Upload.Dragger
                    multiple
                    listType="picture-card"
                    name="files"
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    maxCount={maxCount}
                    accept={formattedAccept}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    className="custom-upload-dragger"
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 3fr",
                                gap: "16px",
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            <div style={{textAlign: "center"}}>
                                <InboxOutlined style={{fontSize: "50px", color: "#1890ff"}}/>
                            </div>
                            <div style={{textAlign: "center"}}>
                                <p className="ant-upload-text" style={{margin: 0}}>
                                    Click or drag file to this area to upload
                                </p>
                                <p className="ant-upload-text" style={{margin: 0}}>
                                    Upload files of format <strong>{displayAccept}</strong> only
                                </p>
                                <p className="ant-upload-text" style={{margin: 0}}>
                                    Maximum size: <strong>{maxSizeMB}MB</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </Upload.Dragger>
            )}

            {previewImage && (
                <Image
                    wrapperStyle={{display: "none"}}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                />
            )}

            <style jsx global>{`
                .custom-upload-dragger .ant-upload-list-picture-card {
                    display: flex !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    padding-top: 16px !important;
                }
            `}</style>
        </>
    );
}