// components/ImageUpload.tsx
import React, {useEffect, useState} from 'react';
import {Upload, UploadFile, UploadProps, notification, Image, FormInstance} from 'antd';
import {InboxOutlined, PlusOutlined} from '@ant-design/icons';

interface ImageUploadProps {
    form: FormInstance; // Form instance to update directly
    fieldName?: string; // Name of the field to update (defaults to 'image')
    maxCount?: number;
    accept?: string;
    maxSizeMB?: number; // Maximum file size in MB
    hideImageUpload?: boolean;
    imageList?: { url: string; filename: string }[];
}

const uploadButton = (
    <button style={{border: 0, background: 'none'}} type="button">
        <PlusOutlined/>
        <div style={{marginTop: 8}}>Upload</div>
    </button>
);

export const ImageUpload: React.FC<ImageUploadProps> = ({
                                                            form,
                                                            fieldName = 'image',
                                                            maxCount = 10,
                                                            accept = 'image/*',
                                                            maxSizeMB = 5,
                                                            hideImageUpload,
                                                            imageList = [],
                                                        }) => {
    const [fileList, setFileList] = useState<UploadFile[]>(form.getFieldValue(fieldName) || []);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);

    // Sync internal state with form field value
    useEffect(() => {
        const currentFiles = form.getFieldValue(fieldName) || [];

        // Convert existing image data into UploadFile format
        const formattedFiles: UploadFile[] = currentFiles.map((file: any) => ({
            uid: file.cloudId, // Unique identifier
            name: file.filename || `Image-${file.cloudId}`, // Use filename or generate one
            status: 'done', // Mark as uploaded
            url: file.url, // Image URL
        }));

        setFileList(formattedFiles);

    }, [form, fieldName]);

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
        console.log("📸 Trước khi cập nhật:", fileList);
        console.log("📥 Ảnh mới được thêm / cập nhật:", newFileList);

        // Danh sách ảnh sau khi cập nhật (gồm cả ảnh cũ và mới nhưng không giữ ảnh bị xóa)
        setFileList(newFileList);
        form.setFieldsValue({[fieldName]: newFileList});

        console.log("📌 Danh sách ảnh sau khi cập nhật:", newFileList);
    };


    const beforeUpload = (file: File) => {
        const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB;
        if (!isLtMaxSize) {
            notification.error({
                message: 'Image too large',
                description: `Image must be smaller than ${maxSizeMB}MB!`,
            });
            return Upload.LIST_IGNORE;
        }
        return false; // Prevent automatic upload since we handle it manually
    };

    return (
        <>
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
                    accept={accept}
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
                                    Upload files of format <strong>png, jpg, jpeg</strong> only
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
};