import React, { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface MyEditorProps {
    description?: string;
    onChange: (value: string) => void; // Hàm callback để cập nhật giá trị lên form
    isReadOnly?: boolean;
}

export default function MyEditor({ description, onChange, isReadOnly }: MyEditorProps) {
    const [content, setContent] = useState<string>(description || "Enter Text Here...");

    useEffect(() => {
        setContent(description || "Enter Text Here...");
    }, [description]);

    const handleEditorChange = (content: string) => {
        setContent(content);
        onChange(content); // Gọi hàm callback để cập nhật form
    };

    return (
         <Editor
             apiKey="yef1yooqlyelh8v19e2boyww0ulgh6czrqafw4sylq03z8dw"
             init={{
               branding: false,
               plugins: "link image media table lists code",
               toolbar:
                   "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code",
               menubar: false,
               height: 250,
               content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
             }}
             value={content}
             onEditorChange={handleEditorChange}
         />
    );
}
