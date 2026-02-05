'use client'

import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  ListBullets,
  Code,
  Quotes,
  TextHOne,
} from '@phosphor-icons/react'

interface ToolbarProps {
  editor: Editor
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="border-b bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur shadow-sm">
      <div className="px-8">
        <div className="flex items-center gap-1 p-2">
          <div className="flex items-center gap-1 border-r border-border/50 pr-2">
            <Button
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <TextHOne className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <span className="text-xs font-bold">H2</span>
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <span className="text-xs font-bold">H3</span>
            </Button>
          </div>

          <div className="flex items-center gap-1 border-r border-border/50 pr-2">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <TextB className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <TextItalic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('strike') ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <TextStrikethrough className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('code') ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-r border-border/50 pr-2">
            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListBullets className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="2" y1="4" x2="6" y2="4" />
                <line x1="2" y1="8" x2="6" y2="8" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="10" y1="4" x2="14" y2="4" />
                <line x1="10" y1="8" x2="14" y2="8" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </Button>
            <Button
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quotes className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
