"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { getExtensions } from "./extensions";
import { EditorToolbar } from "./EditorToolbar";

interface EditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  editable?: boolean;
}

export function Editor({
  content = "",
  onUpdate,
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: getExtensions(),
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
  });

  return (
    <div className="flex flex-col w-full rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden">
      {editable && <EditorToolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
