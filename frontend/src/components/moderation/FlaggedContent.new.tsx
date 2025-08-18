import React, { useState, useCallback } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Typography, 
  Modal, 
  Input, 
  TablePaginationConfig, 
  message,
  Dropdown,
  Card,
  Empty,
  Spin,
  Alert,
  MenuProps,
  Space
} from 'antd';
import type { MenuProps as AntdMenuProps } from 'antd';
import ModerationErrorBoundary from './ModerationErrorBoundary';
import { 
  CheckOutlined, 
  CloseOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined,
  MoreOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

// Mock the services for now - these should be replaced with actual service imports
const getFlaggedContent = async (params: any) => {
  // Mock implementation
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10
  };
};

const reviewFlaggedContent = async (flagId: string, data: any) => {
  // Mock implementation
  return {
    success: true,
    message: 'Success',
    data: {}
  };
};

const { Text } = Typography;

export type FlagStatus = 'pending' | 'resolved' | 'rejected';

export interface FlaggedContent {
  id: string;
  content_id: string;
  content_type: string;
  reason: string;
  status: FlagStatus;
  created_at: string;
  updated_at: string;
  content: {
    id: string;
    text?: string;
    title?: string;
    author?: {
      id: string;
      username: string;
    };
  };
}

export interface FlaggedContentResponse {
  data: FlaggedContent[];
  total: number;
  page: number;
  limit: number;
}

interface ReviewAction {
  flagId: string;
  action: 'approve' | 'reject' | 'delete';
  note?: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, any>;
}

interface FlaggedContentProps {
  status?: FlagStatus;
}

export const FlaggedContent = ({ status = 'pending' }: FlaggedContentProps) => {
  const [selectedFlag, setSelectedFlag] = useState<FlaggedContent | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'delete'>();
  const queryClient = useQueryClient();

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<FlaggedContentResponse, Error>({
    queryKey: ['flaggedContent', status],
    queryFn: () => getFlaggedContent({ 
      status, 
      page: 1, 
      limit: 10 
    }),
  });

  const { 
    mutate: reviewContent, 
    isPending: isReviewing 
  } = useMutation<{ success: boolean; message: string; data: any }, Error, ReviewAction>({
    mutationFn: ({ flagId, action, note }) =>
      reviewFlaggedContent(flagId, { action, note }),
    onSuccess: () => {
      message.success('Action completed successfully');
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['flaggedContent'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Failed to submit review');
    },
  });

  const handleTableChange = useCallback((pagination: TablePaginationConfig) => {
    setTableParams((prev: TableParams) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    }));
  }, []);

  const handleReview = (flagId: string, action: 'approve' | 'reject' | 'delete') => {
    setSelectedFlag({ id: flagId } as FlaggedContent);
    setAction(action);
    setIsModalVisible(true);
    setReviewNote('');
  };

  const handleConfirmReview = () => {
    if (!selectedFlag || !action) return;
    
    reviewContent({
      flagId: selectedFlag.id,
      action,
      note: reviewNote,
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
      resolved: { color: 'green', icon: <CheckOutlined />, text: 'Resolved' },
      rejected: { color: 'red', icon: <CloseOutlined />, text: 'Rejected' },
    } as const;
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      color: 'default' as const, 
      icon: null, 
      text: status 
    };

    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  const getActionItems = (record: FlaggedContent): MenuProps['items'] => [
    {
      key: 'approve',
      label: 'Approve',
      icon: <CheckOutlined />,
      onClick: () => handleReview(record.id, 'approve'),
    },
    {
      key: 'reject',
      label: 'Reject Flag',
      icon: <CloseOutlined />,
      danger: true,
      onClick: () => handleReview(record.id, 'reject'),
    },
    {
      key: 'delete',
      label: 'Delete Content',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleReview(record.id, 'delete'),
    },
  ];

  const columns = [
    {
      title: 'Content',
      dataIndex: ['content', 'text'],
      key: 'content',
      render: (_: any, record: FlaggedContent) => (
        <Space direction="vertical" size="small">
          <Text>{record.content.text || 'No content available'}</Text>
          {record.content.author && (
            <Text type="secondary">By: {record.content.author.username}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Reported',
      dataIndex: 'created_at',
      key: 'reported',
      render: (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true }),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: FlaggedContent) => (
        <Dropdown 
          menu={{ items: getActionItems(record) }} 
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size="large" />
          <div>Loading flagged content...</div>
        </div>
      );
    }

    if (isError) {
      return (
        <Alert
          message="Error loading flagged content"
          description={error?.message || 'An unknown error occurred'}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      );
    }

    return (
      <Table
        columns={columns}
        rowKey="id"
        dataSource={data?.data || []}
        pagination={{
          ...tableParams.pagination,
          total: data?.total,
          showSizeChanger: true,
          showTotal: (total: number) => `Total ${total} items`,
        }}
        loading={isLoading}
        onChange={handleTableChange}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>No {status} flags found</span>
              }
            />
          ),
        }}
      />
    );
  }, [data, isError, isLoading, status, tableParams.pagination, handleTableChange]);

  return (
    <ModerationErrorBoundary componentName="Flagged Content">
      <Card 
        title={`${status.charAt(0).toUpperCase() + status.slice(1)} Flags`}
        style={{ minHeight: '60vh' }}
      >
        {renderContent()}
        <Modal
          title={
            <>
              <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
              Confirm {action}
            </>
          }
          open={isModalVisible}
          onOk={handleReview}
          onCancel={() => setIsModalVisible(false)}
          confirmLoading={reviewMutation.isLoading}
          okText={
            action === 'approve' ? 'Approve' : 
            action === 'reject' ? 'Reject Flag' : 'Delete Content'
          }
          okButtonProps={{
            danger: action === 'delete' || action === 'reject',
            type: action === 'delete' ? 'primary' : 'default' as const
          }}
        >
          <p>
            {action === 'approve' && 'Are you sure you want to approve this content and dismiss the flag?'}
            {action === 'reject' && 'Are you sure you want to reject this flag? The content will remain as is.'}
            {action === 'delete' && 'Are you sure you want to delete this content? This action cannot be undone.'}
          </p>
          <p style={{ margin: '16px 0 8px' }}>
            <Text strong>Add a note (optional):</Text>
          </p>
          <Input.TextArea
            rows={3}
            value={reviewNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNote(e.target.value)}
            placeholder="Add a note about this action..."
          />
        </Modal>
      </Card>
    </ModerationErrorBoundary>
  );
};

// Create a wrapper component that provides the QueryClient
const FlaggedContentWithProvider: React.FC<FlaggedContentProps> = (props) => {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ModerationErrorBoundary>
        <FlaggedContent {...props} />
      </ModerationErrorBoundary>
    </QueryClientProvider>
  );
};

export default FlaggedContentWithProvider;
