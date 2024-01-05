import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useState } from 'react';

interface TiptapEditorProps {
    onContentChange?: (content: string) => void;
    className?: string;
}


const TiptapEditor: React.FC<TiptapEditorProps> = ({ onContentChange, className }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Link,
            Image,
        ],
        content: '',
    });

    const [isEditorReady, setIsEditorReady] = useState(false);


    const setBold = () => {
        if (editor) {
            editor.chain().focus().toggleBold().run();
        }
    };

    const setItalic = () => {
        if (editor) {
            editor.chain().focus().toggleItalic().run();
        }
    }

    const setUnderline = () => {
        if (editor) {
            editor.chain().focus().toggleUnderline().run();
        }
    }

    const setStrike = () => {
        if (editor) {
            editor.chain().focus().toggleStrike().run();
        }
    }

    const setCode = () => {
        if (editor) {
            editor.chain().focus().toggleCode().run();
        }
    }

    // const setBlockquote = () => {
    //     if (editor) {
    //         editor.chain().focus().toggleBlockquote().run();
    //     }
    // }

    const setBulletList = () => {
        if (editor) {
            editor.chain().focus().toggleBulletList().run();
        }
    }

    const setOrderedList = () => {
        if (editor) {
            editor.chain().focus().toggleOrderedList().run();
        }
    }

    // const setHorizontalRule = () => {
    //     if (editor) {
    //         editor.chain().focus().setHorizontalRule().run();
    //     }
    // }

    const setLink = () => {
        if (editor) {
            editor.chain().focus().toggleLink({ href: 'https://example.com' }).run();
        }
    }

    const setImage = () => {
        if (editor) {
            editor.chain().focus().setImage({ src: 'https://example.com/image.png' }).run();
        }
    }

    useEffect(() => {
        if (editor) {
            setIsEditorReady(true);
            editor.on('update', () => {
                const html = editor.getHTML();
                if (onContentChange) {
                    onContentChange(html);
                }
            });
        }
    }, [editor, onContentChange]);


    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
            />

            <div className='border rounded'>
                {isEditorReady ? (
                    <div className="editor-toolbar py-1 px-1 border-bottom">
                        <button type="button" onClick={setBold} className={`editor-button ${editor?.isActive('bold') ? 'is-active' : ''}`}>
                            <i className="fas fa-bold"></i>
                        </button>
                        <button type="button" onClick={setItalic} className={`editor-button ${editor?.isActive('italic') ? 'is-active' : ''}`}>
                            <i className="fas fa-italic"></i>
                        </button>
                        <button type="button" onClick={setUnderline} className={`editor-button ${editor?.isActive('underline') ? 'is-active' : ''}`}>
                            <i className="fas fa-underline"></i>
                        </button>
                        <button type="button" onClick={setStrike} className={`editor-button ${editor?.isActive('strike') ? 'is-active' : ''}`}>
                        <i className="fa-solid fa-strikethrough"></i>
                        </button>
                        <button type="button" onClick={setCode} className={`editor-button ${editor?.isActive('code') ? 'is-active' : ''}`}>
                        <i className="fas fa-code"></i>
                        </button>
                        {/* <button type="button" onClick={setBlockquote} className={`editor-button ${editor?.isActive('blockquote') ? 'is-active' : ''}`}>
                        <i className="fa-solid fa-block-quote"></i>                   
                        </button> */}
                        <button type="button" onClick={setBulletList} className={`editor-button ${editor?.isActive('bulletList') ? 'is-active' : ''}`}>
                        <i className="fa-solid fa-list"></i>
                        </button>
                        <button type="button" onClick={setOrderedList} className={`editor-button ${editor?.isActive('orderedList') ? 'is-active' : ''}`}>
                        <i className="fas fa-list-ol"></i>
                        </button>
                        {/* <button type="button" onClick={setHorizontalRule} className={`editor-button ${editor?.isActive('horizontalRule') ? 'is-active' : ''}`}>
                        <i className="fa-solid fa-horizontal-rule"></i>
                        </button> */}
                        <button type="button" onClick={setLink} className={`editor-button ${editor?.isActive('link') ? 'is-active' : ''}`}>
                        <i className="fas fa-link"></i>
                        </button>
                        <button type="button" onClick={setImage} className={`editor-button ${editor?.isActive('image') ? 'is-active' : ''}`}>
                        <i className="fas fa-image"></i>
                        </button>


                    </div>
                ) : (
                    <p>Loading editor...</p>
                )}
                <div className={className}>
                    <EditorContent editor={editor} />
                </div>
            </div>
        </>
    );
};

export default TiptapEditor;
