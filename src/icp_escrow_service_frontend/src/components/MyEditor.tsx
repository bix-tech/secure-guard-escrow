import React, { useState, useEffect } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js';

type MyEditorProps = {
    initialValue: string;
    value: string;
    onEditorChange: (content: string) => void;
};

const MyEditor: React.FC<MyEditorProps> = ({ initialValue, value, onEditorChange }) => {
    const safeParseJSON = (jsonString: string) => {
        if (!jsonString) return null; 
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Error parsing JSON string:", e);
            return null;
        }
    };

    const [editorState, setEditorState] = useState(() => {
        const initialContent = safeParseJSON(initialValue);
        if (initialContent) {
            return EditorState.createWithContent(convertFromRaw(initialContent));
        } else {
            return EditorState.createEmpty();
        }
    });

    useEffect(() => {
        const newContent = safeParseJSON(value);
        if (newContent) {
            setEditorState(EditorState.createWithContent(convertFromRaw(newContent)));
        }
    }, [value]);

    const onChange = (newEditorState: EditorState) => {
        setEditorState(newEditorState);
        const rawContent = convertToRaw(newEditorState.getCurrentContent());
        const contentString = JSON.stringify(rawContent);
        onEditorChange(contentString);
    };

    return <Editor editorState={editorState} onChange={onChange} />;
};

export default MyEditor;
