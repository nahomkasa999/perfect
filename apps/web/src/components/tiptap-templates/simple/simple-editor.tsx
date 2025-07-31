"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor, Editor } from "@tiptap/react"
import { io, Socket } from "socket.io-client";

import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useScrolling } from "@/hooks/use-scrolling"

import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

import "@/components/tiptap-templates/simple/simple-editor.scss"

import content from "@/components/tiptap-templates/simple/data/content.json"

const socket: Socket = io("http://localhost:3001");

interface MainToolbarContentProps {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: MainToolbarContentProps) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

interface MobileToolbarContentProps {
  type: "highlighter" | "link";
  onBack: () => void;
}

const MobileToolbarContent = ({
  type,
  onBack,
}: MobileToolbarContentProps) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor() {
  const isMobile = useIsMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const lastSentContentRef = React.useRef<string>("");
  const sentenceToReplaceRef = React.useRef<string | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const processAndSendContent = React.useCallback((editor: Editor) => {
    const currentText = editor.getText();
    const newContent = currentText.substring(lastSentContentRef.current.length);

    if (newContent.length === 0) {
      return;
    }

    const sentenceEndings = /[.?!]\s*$/;
    const paragraphBreak = /\n\n/;

    let shouldSend = false;
    let textToSend = newContent.trim(); // Trim for sending to AI

    if (sentenceEndings.test(newContent)) {
      shouldSend = true;
    } else if (paragraphBreak.test(newContent)) {
      const parts = newContent.split(paragraphBreak);
      textToSend = parts[0].trim();
      shouldSend = true;
    }

    if (shouldSend && textToSend.length > 0) {
      console.log("Sending to AI:", textToSend);
      socket.emit("sendToGoogleApi", { prompt: textToSend });
      sentenceToReplaceRef.current = textToSend; // Store the exact sentence sent
      lastSentContentRef.current = currentText;
    } else if (newContent.length > 0 && debounceTimeoutRef.current === null) {
      console.log("Sending accumulated text to AI (debounce):", newContent.trim());
      socket.emit("sendToGoogleApi", { prompt: newContent.trim() });
      sentenceToReplaceRef.current = newContent.trim(); // Store the exact text sent
      lastSentContentRef.current = currentText;
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        upload: handleImageUpload,
        onError: (error: Error) => console.error("Upload failed:", error),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        processAndSendContent(editor);
        debounceTimeoutRef.current = null;
      }, 700);
    },
  });

  React.useEffect(() => {
    const handleApiResponse = (arg: { text: Array<{ text: string }> }) => {
        if (editor && sentenceToReplaceRef.current !== null) {
            const correctedTextParts = arg.text.map(part => part.text).join('');
            const originalText = sentenceToReplaceRef.current;

            const editorContent = editor.getText();
            const lastIndex = editorContent.lastIndexOf(originalText);

            if (lastIndex !== -1) {
                const start = lastIndex;
                const end = lastIndex + originalText.length;

                editor.chain().focus()
                    .setTextSelection({ from: start, to: end })
                    .insertContent(correctedTextParts)
                    .run();

                lastSentContentRef.current = editor.getText();
                sentenceToReplaceRef.current = null;
            }
        }
    };

    socket.on("googleApiResponse", handleApiResponse);

    return () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        socket.off("googleApiResponse", handleApiResponse);
    };
  }, [editor]);

  const isScrolling = useScrolling()
  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isScrolling && isMobile
              ? { opacity: 0, transition: "opacity 0.1s ease-in-out" }
              : {}),
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${windowSize.height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}
