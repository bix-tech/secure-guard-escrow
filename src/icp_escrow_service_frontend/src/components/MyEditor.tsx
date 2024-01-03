import React, { useState, useEffect } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw, Modifier } from 'draft-js';

type MyEditorProps = {
  initialValue: string;
  value: string;
  onEditorChange: (content: string) => void;
};

type StyleButtonProps = {
  onToggle: (style: string) => void;
  style: string;
  active: boolean;
  label: string;
};

const inlineStyleTypes = [
  { label: 'B', style: 'BOLD' },
  { label: 'I', style: 'ITALIC' },
  { label: 'U', style: 'UNDERLINE' },
];
  
const StyleButton: React.FC<StyleButtonProps> = ({ onToggle, style, active, label }) => {
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(style);
  };

  let className = 'myEditor-button';
  if (active) {
    className += ' active';
  }

  return (
    <span className={className} onMouseDown={onMouseDown}>
      {label}
    </span>
  );
};

const MyEditor: React.FC<MyEditorProps> = ({ initialValue, value, onEditorChange }) => {

  const safeParseJSON = (jsonString: string) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON string:', e);
      return null;
    }
  };

  const [editorState, setEditorState] = useState(() => {
    const initialContent = safeParseJSON(initialValue);
    return initialContent
      ? EditorState.createWithContent(convertFromRaw(initialContent))
      : EditorState.createEmpty();
  });

  function applyInlineStyle(editorState: EditorState, inlineStyle: string): EditorState {
    const currentContent = editorState.getCurrentContent();
    const currentStyle = editorState.getCurrentInlineStyle();
    
    const nextContentState = currentStyle.has(inlineStyle)
      ? Modifier.removeInlineStyle(currentContent, editorState.getSelection(), inlineStyle)
      : Modifier.applyInlineStyle(currentContent, editorState.getSelection(), inlineStyle);
    
    return EditorState.push(editorState, nextContentState, 'change-inline-style');
  }
  useEffect(() => {
    const newContent = safeParseJSON(value);
    if (newContent) {
      setEditorState(EditorState.createWithContent(convertFromRaw(newContent)));
    }
  }, [value]);

  const onChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const rawContent = convertToRaw(newEditorState.getCurrentContent());
    onEditorChange(JSON.stringify(rawContent));
  };

  const toggleInlineStyle = (inlineStyle: string) => {
    setEditorState(applyInlineStyle(editorState, inlineStyle));
  };

  const renderInlineStyleButtons = () => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return inlineStyleTypes.map((type) => (
      <StyleButton
        key={type.label}
        active={currentStyle.has(type.style)}
        label={type.label}
        onToggle={toggleInlineStyle}
        style={type.style}
      />
    ));
  };

  return (
    <div className="myEditor-container">
      <div className="myEditor-toolbar">
        {renderInlineStyleButtons()}
      </div>
      <Editor editorState={editorState} onChange={onChange} />
    </div>
  );
};

export default MyEditor;
