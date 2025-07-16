import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownViewerProps {
  filePath?: string; // Path to markdown file in public or docs folder
  content?: string;  // Direct markdown content
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ filePath, content }) => {
  const [md, setMd] = useState<string>(content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (filePath) {
      setLoading(true);
      fetch(filePath)
        .then(res => res.ok ? res.text() : Promise.reject('Failed to load'))
        .then(setMd)
        .catch(() => setError('Failed to load documentation.'))
        .finally(() => setLoading(false));
    }
  }, [filePath]);

  if (loading) return <div>Loading documentation…</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!md) return <div>No documentation found.</div>;

  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{md}</ReactMarkdown>
    </div>
  );
}; 