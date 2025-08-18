import React, { useState, useEffect } from 'react';
import { Typography, Skeleton, Button, Card, Avatar } from 'antd';
import { UserOutlined, CommentOutlined, MessageOutlined } from '@ant-design/icons';

// Mock service functions - replace with actual service imports
const getContentById = async (type: string, id: string) => {
  // Mock implementation
  return {
    id,
    text: 'Sample content',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...(type === 'whisper' ? { is_anonymous: false, likes_count: 0, comments_count: 0 } : { whisper_id: 'whisper-1' })
  };
};

const getUserById = async (id: string) => {
  // Mock implementation
  return {
    id,
    username: 'testuser',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

const { Text } = Typography;

export type ContentType = 'whisper' | 'comment' | 'user';

export interface Author {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface BaseContent {
  id: string;
  created_at: string;
  updated_at: string;
  author?: Author;
}

interface WhisperContent extends BaseContent {
  text: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
}

interface CommentContent extends BaseContent {
  text: string;
  whisper_id: string;
}

interface UserContent {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  bio?: string;
}

type ContentData = WhisperContent | CommentContent | UserContent | null;

export interface ContentPreviewProps {
  contentId: string;
  contentType: ContentType;
  maxLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  contentId,
  contentType,
  maxLength = 100,
  className = '',
  style = {}
}) => {
  const [content, setContent] = useState<ContentData>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullContent, setShowFullContent] = useState<boolean>(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data: ContentData;
        if (contentType === 'user') {
          data = await getUserById(contentId) as UserContent;
        } else {
          data = await getContentById(contentType, contentId) as WhisperContent | CommentContent;
        }
        
        setContent(data);
      } catch (err: unknown) {
        console.error(`Error fetching ${contentType}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId, contentType]);

  // Type guard to check if content is UserContent
  const isUserContent = (item: ContentData): item is UserContent => {
    return (item as UserContent).username !== undefined;
  };

  // Type guard to check if content is WhisperContent
  const isWhisperContent = (item: ContentData): item is WhisperContent => {
    return (item as WhisperContent).is_anonymous !== undefined;
  };

  // Type guard to check if content is CommentContent
  const isCommentContent = (item: ContentData): item is CommentContent => {
    return (item as CommentContent).whisper_id !== undefined;
  };

  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (
        <Card style={style} className={className}>
          <Skeleton active />
        </Card>
      );
    }

    if (error) {
      return (
        <Card style={style} className={className}>
          <Text type="danger">{error}</Text>
        </Card>
      );
    }

    if (!content) {
      return (
        <Card style={style} className={className}>
          <Text type="secondary">No content available</Text>
        </Card>
      );
    }

    if (isUserContent(content)) {
      return (
        <Card 
          style={style} 
          className={className}
          actions={[
            <Button key="view" type="link">View Profile</Button>
          ]}
        >
          <Card.Meta
            avatar={
              content.avatar_url ? (
                <Avatar src={content.avatar_url} size={64} />
              ) : (
                <Avatar icon={<UserOutlined />} size={64} />
              )
            }
            title={content.username}
            description={content.bio || 'No bio available'}
          />
        </Card>
      );
    }

    const contentText = isWhisperContent(content) || isCommentContent(content) 
    ? content.text 
    : '';

    const needsTruncation = contentText.length > maxLength;
    const displayText = showFullContent || !needsTruncation
      ? contentText 
      : `${contentText.substring(0, maxLength)}...`;
    
    const isAnonymous = isWhisperContent(content) ? content.is_anonymous : false;
    
    return (
      <Card 
        style={style} 
        className={className}
        actions={[
          isWhisperContent(content) && (
            <span key="likes">
              <Button type="text" icon={<MessageOutlined />}>
                {content.comments_count}
              </Button>
              <Button type="text" icon={<MessageOutlined />}>
                {content.likes_count}
              </Button>
            </span>
          ),
          needsTruncation && (
            <Button 
              key="toggle" 
              type="link" 
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? 'Show less' : 'Show more'}
            </Button>
          )
        ].filter(Boolean) as React.ReactNode[]}
      >
        <Card.Meta
          avatar={
            content.author?.avatar_url ? (
              <Avatar src={content.author.avatar_url} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )
          }
          title={content.author?.username || 'Anonymous'}
          description={
            <>
              <div>{displayText}</div>
              {isCommentContent(content) && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <CommentOutlined /> In reply to whisper: {content.whisper_id}
                  </Text>
                </div>
              )}
            </>
          }
        />
      </Card>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};
