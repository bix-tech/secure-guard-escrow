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

    const setBlockquote = () => {
        if (editor) {
            editor.chain().focus().toggleBlockquote().run();
        }
    }

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

    const setHorizontalRule = () => {
        if (editor) {
            editor.chain().focus().setHorizontalRule().run();
        }
    }

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
            {isEditorReady ? (
                <div className="editor-toolbar">
                    <button type="button" onClick={setBold} className={editor?.isActive('bold') ? 'is-active' : ''}>
                        Bold
                    </button>
                    <button type="button" onClick={setItalic} className={editor?.isActive('italic') ? 'is-active' : ''}>
                        Italic
                    </button>
                    <button type="button" onClick={setUnderline} className={editor?.isActive('underline') ? 'is-active' : ''}>
                        Underline
                    </button>
                    <button type="button" onClick={setStrike} className={editor?.isActive('strike') ? 'is-active' : ''}>
                        Strike
                    </button>
                    <button type="button" onClick={setCode} className={editor?.isActive('code') ? 'is-active' : ''}>
                        Code
                    </button>
                    <button type="button" onClick={setBlockquote} className={editor?.isActive('blockquote') ? 'is-active' : ''}>
                        Blockquote
                    </button>
                    <button type="button" onClick={setBulletList} className={editor?.isActive('bulletList') ? 'is-active' : ''}>
                        Bullet List
                    </button>
                    <button type="button" onClick={setOrderedList} className={editor?.isActive('orderedList') ? 'is-active' : ''}>
                        Ordered List
                    </button>
                    <button type="button" onClick={setHorizontalRule} className={editor?.isActive('horizontalRule') ? 'is-active' : ''}>
                        Horizontal Rule
                    </button>
                    <button type="button" onClick={setLink} className={editor?.isActive('link') ? 'is-active' : ''}>
                        Link
                    </button>
                    <button type="button" onClick={setImage} className={editor?.isActive('image') ? 'is-active' : ''}>
                        Image
                    </button>


                </div>
            ) : (
                <p>Loading editor...</p>
            )}
            <div className={className}>

                <EditorContent editor={editor} />
            </div>

        </>
    );
};

export default TiptapEditor;
