import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Typography from "@tiptap/extension-typography";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export function getExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    Underline,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Placeholder.configure({
      placeholder: "Start writing...",
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    Image,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Highlight.configure({
      multicolor: true,
    }),
    TextStyle,
    Color,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Typography,
  ];
}
