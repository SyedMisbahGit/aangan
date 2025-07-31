import { useState, useEffect } from 'react';
import { Typography, Skeleton, Button, Tooltip } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import { getContentById } from '../../../services/content.service';
import { getUserById } from '../../../services/user.service';

const { Text, Link } = Typography;

type ContentType = 'whisper' | 'comment' | 'user';

interface ContentPreviewProps {
  contentId: string;
  contentType: ContentType;
  maxLength?: number;
}

export function ContentPreview({ contentId, contentType, maxLength = 100 }: ContentPreviewProps) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        let data;
        
        if (contentType === 'user') {
          data = await getUserById(contentId);
        } else {
          data = await getContentById(contentType, contentId);
        }
        
        setContent(data);
      } catch (err) {
        console.error(`Error fetching ${contentType}:`, err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId, contentType]);

  const renderContent = () => {
    if (loading) {
      return <Skeleton paragraph={{ rows: 1 }} active />;
    }

    if (error || !content) {
      return <Text type="secondary">[Content not available]</Text>;
    }

    switch (contentType) {
      case 'whisper':
        return renderWhisperContent();
      case 'comment':
        return renderCommentContent();
      case 'user':
        return renderUserContent();
      default:
        return <Text type="secondary">[Unsupported content type]</Text>;
    }
  };

  const renderWhisperContent = () => {
    const text = content.text || '';
    const shouldTruncate = text.length > maxLength && !showFullContent;
    const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

    return (
      <div>
        <Text>{displayText}</Text>
        {text.length > maxLength && (
          <Button 
            type="link" 
            size="small" 
            onClick={() => setShowFullContent(!showFullContent)}
            style={{ padding: '0 4px', height: 'auto' }}
          >
            {showFullContent ? 'Show less' : 'Read more'}
          </Button>
        )}
        {content.media_url && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <EyeOutlined /> Contains media
            </Text>
          </div>
        )}
      </div>
    );
  };

  const renderCommentContent = () => {
    const text = content.text || '';
    const shouldTruncate = text.length > maxLength && !showFullContent;
    const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

    return (
      <div>
        <Text>{displayText}</Text>
        {text.length > maxLength && (
          <Button 
            type="link" 
            size="small" 
            onClick={() => setShowFullContent(!showFullContent)}
            style={{ padding: '0 4px', height: 'auto' }}
          >
            {showFullContent ? 'Show less' : 'Read more'}
          </Button>
        )}
        <div style={{ marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            On whisper: {content.whisper_id ? `#${content.whisper_id.substring(0, 6)}...` : 'N/A'}
          </Text>
        </div>
      </div>
    );
  };

  const renderUserContent = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: 8 }}>
          {content.avatar_url ? (
            <img 
              src={content.avatar_url} 
              alt={content.username} 
              style={{ width: 24, height: 24, borderRadius: '50%' }} 
            />
          ) : (
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c8c8c'
            }}>
              <UserOutlined />
            </div>
          )}
        </div>
        <div>
          <div>
            <Text strong>{content.display_name || content.username || 'Anonymous'}</Text>
            {content.username && (
              <Text type="secondary" style={{ marginLeft: 8 }}>@{content.username}</Text>
            )}
          </div>
          {content.bio && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" ellipsis={{ tooltip: content.bio }}>
                {content.bio.length > 60 
                  ? `${content.bio.substring(0, 60)}...` 
                  : content.bio}
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getContentLink = () => {
    if (!content) return null;
    
    switch (contentType) {
      case 'whisper':
        return `/whispers/${contentId}`;
      case 'comment':
        return `/whispers/${content.whisper_id}?comment=${contentId}`;
      case 'user':
        return `/users/${content.username || contentId}`;
      default:
        return null;
    }
  };

  const link = getContentLink();
  
  return (
    <div>
      {link ? (
        <Tooltip title={`View ${contentType}`}>
          <Link href={link} target="_blank" rel="noopener noreferrer">
            {renderContent()}
          </Link>
        </Tooltip>
      ) : (
        renderContent()
      )}
    </div>
  );
}
