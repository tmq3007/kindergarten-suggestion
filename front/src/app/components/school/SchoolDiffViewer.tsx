'use client';
import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface Props {
    original: string | undefined;
    draft: string | undefined;
    title?: string;
    disableWordDiff?: boolean;
}

const SchoolDiffViewer: React.FC<Props> = ({ original, draft, title, disableWordDiff }) => {
    return (
        <div className="my-4">
            {title && <h2 className="text-xl font-bold mb-2">{title}</h2>}
            <ReactDiffViewer
                oldValue={original}
                newValue={draft}
                splitView={true}
                showDiffOnly={false}
                hideLineNumbers={true}
                disableWordDiff={disableWordDiff}
            />
        </div>
    );
};

export default SchoolDiffViewer;
