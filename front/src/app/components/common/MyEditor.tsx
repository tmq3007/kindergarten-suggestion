import React from "react";
import { Editor } from "@tinymce/tinymce-react";

interface MyEditorProps {
    description?: string;
}

export default function MyEditor({ description }: MyEditorProps) {
    const handleEditorChange = (content: string, editor: any) => {
        console.log("Editor content:", content);
    };

    return (
        <Editor
            apiKey="yef1yooqlyelh8v19e2boyww0ulgh6czrqafw4sylq03z8dw"
            init={{
                branding: false,
                plugins: "link image media table lists code", // Chỉ sử dụng các plugin cơ bản
                toolbar:
                    "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code",
                menubar: false,
                height: 250,
                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
            initialValue={description ? description : "Enter Text Here..."}
            onEditorChange={handleEditorChange} // Add this to log content changes
        />
    );
}