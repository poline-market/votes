'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownBioProps {
    content: string
    className?: string
}

/**
 * Renders user bio with Markdown support
 * Supports: bold, italic, links, lists, code, strikethrough
 */
export function MarkdownBio({ content, className }: MarkdownBioProps) {
    if (!content) return null

    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Customize link styling
                    a: ({ node, ...props }) => (
                        <a
                            {...props}
                            className="text-primary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                    // Limit heading sizes for bio
                    h1: ({ node, ...props }) => <h3 {...props} className="text-lg font-semibold" />,
                    h2: ({ node, ...props }) => <h4 {...props} className="text-base font-semibold" />,
                    h3: ({ node, ...props }) => <h5 {...props} className="text-sm font-semibold" />,
                    // Style code blocks
                    code: ({ node, ...props }) => (
                        <code {...props} className="bg-muted px-1 py-0.5 rounded text-xs" />
                    ),
                    // Style lists
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside my-1" />,
                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside my-1" />,
                    // Paragraphs
                    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
