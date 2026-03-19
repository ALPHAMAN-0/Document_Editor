"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  CodeXml,
  Table,
  ImageIcon,
  Palette,
  Highlighter,
  Undo2,
  Redo2,
} from "lucide-react";
import { useCallback } from "react";

interface EditorToolbarProps {
  editor: Editor | null;
}

const TEXT_COLORS = [
  { name: "Default", value: "inherit" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Purple", value: "#e9d5ff" },
];

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        isActive
          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-[var(--border)] mx-1" />;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  if (!editor) return null;

  const iconSize = 16;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--background)] px-2 py-1.5">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <Underline size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Inline Code"
      >
        <Code size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        title="Task List"
      >
        <ListTodo size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <CodeXml size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={insertTable} title="Insert Table (3x3)">
        <Table size={iconSize} />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        <ImageIcon size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Colors */}
      <div className="relative group">
        <ToolbarButton
          onClick={() => {}}
          title="Text Color"
          isActive={editor.isActive("textStyle")}
        >
          <Palette size={iconSize} />
        </ToolbarButton>
        <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-wrap gap-1 p-2 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-20 w-40">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.name}
              onClick={() => {
                if (color.value === "inherit") {
                  editor.chain().focus().unsetColor().run();
                } else {
                  editor.chain().focus().setColor(color.value).run();
                }
              }}
              className="w-6 h-6 rounded border border-[var(--border)] hover:scale-110 transition-transform"
              style={{
                backgroundColor:
                  color.value === "inherit" ? "transparent" : color.value,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative group">
        <ToolbarButton
          onClick={() => {}}
          title="Highlight"
          isActive={editor.isActive("highlight")}
        >
          <Highlighter size={iconSize} />
        </ToolbarButton>
        <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-wrap gap-1 p-2 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg z-20 w-40">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.name}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: color.value })
                  .run()
              }
              className="w-6 h-6 rounded border border-[var(--border)] hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
            />
          ))}
          <button
            type="button"
            title="Remove Highlight"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="w-6 h-6 rounded border border-[var(--border)] hover:scale-110 transition-transform text-xs text-[var(--muted-foreground)]"
          >
            x
          </button>
        </div>
      </div>

      <ToolbarDivider />

      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 size={iconSize} />
      </ToolbarButton>
    </div>
  );
}
