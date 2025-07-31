import { useState, useCallback } from 'react';
import { 
  Table, Tag, Button, Space, Typography, Card, 
  Dropdown, MenuProps, message, Modal, Input, Empty, Badge
} from 'antd';
import { 
  FlagOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFlaggedContent, 
  reviewFlaggedContent 
} from '../../../services/moderation.service';
import { formatDistanceToNow } from 'date-fns';
import { ContentPreview } from './ContentPreview';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

type FlagStatus = 'pending' | 'resolved' | 'rejected';

export function FlaggedContent({ status = 'pending' as FlagStatus }) {
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'delete'>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const queryClient = useQueryClient();

  // Fetch flagged content
  const { data, isLoading, isError } = useQuery({
    queryKey: ['flaggedContent', status, pagination.current, pagination.pageSize],
    queryFn: () => 
      getFlaggedContent({ 
        status,
        page: pagination.current,
        limit: pagination.pageSize
      }),
    keepPreviousData: true,
  });

  // Handle flag review
  const reviewMutation = useMutation({
    mutationFn: ({ flagId, action, note }: { flagId: string, action: 'approve' | 'reject' | 'delete', note?: string }) =>
      reviewFlaggedContent(flagId, action, note),
    onSuccess: () => {
      message.success('Review submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['flaggedContent'] });
      queryClient.invalidateQueries({ queryKey: ['moderationStats'] });
      setIsModalVisible(false);
      setReviewNote('');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to submit review');
    },
  });

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const showReviewModal = (flag: any, action: 'approve' | 'reject' | 'delete') => {
    setSelectedFlag(flag);
    setAction(action);
    setIsModalVisible(true);
  };

  const handleReview = () => {
    if (!selectedFlag) return;
    
    reviewMutation.mutate({
      flagId: selectedFlag.id,
      action: action!,
      note: reviewNote || undefined,
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending' },
      resolved: { color: 'green', icon: <CheckOutlined />, text: 'Resolved' },
      rejected: { color: 'red', icon: <CloseOutlined />, text: 'Rejected' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    
    return (
      <Tag 
        color={statusInfo.color} 
        icon={statusInfo.icon}
        style={{ textTransform: 'capitalize' }}
      >
        {statusInfo.text}
      </Tag>
    );
  };

  const getContentTypeTag = (type: string) => {
    const typeMap = {
      whisper: { color: 'blue', text: 'Whisper' },
      comment: { color: 'purple', text: 'Comment' },
      user: { color: 'cyan', text: 'User' },
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
    
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  const getReasonTag = (reason: string) => {
    const reasonMap: Record<string, { color: string, text: string }> = {
      spam: { color: 'red', text: 'Spam' },
      harassment: { color: 'volcano', text: 'Harassment' },
      inappropriate: { color: 'orange', text: 'Inappropriate' },
      other: { color: 'default', text: 'Other' },
    };

    const reasonInfo = reasonMap[reason.toLowerCase()] || { color: 'default', text: reason };
    return <Tag color={reasonInfo.color}>{reasonInfo.text}</Tag>;
  };

  const getActionItems = (record: any): MenuProps['items'] => [
    {
      key: 'approve',
      label: 'Approve Content',
      icon: <CheckOutlined />,
      disabled: status !== 'pending',
      onClick: () => showReviewModal(record, 'approve'),
    },
    {
      key: 'reject',
      label: 'Reject Flag',
      icon: <CloseOutlined />,
      disabled: status !== 'pending',
      danger: true,
      onClick: () => showReviewModal(record, 'reject'),
    },
    {
      key: 'delete',
      label: 'Delete Content',
      icon: <DeleteOutlined />,
      disabled: status !== 'pending',
      danger: true,
      onClick: () => showReviewModal(record, 'delete'),
    },
  ];

  const columns = [
    {
      title: 'Content',
      dataIndex: 'content_preview',
      key: 'content',
      render: (_: any, record: any) => (
        <div style={{ maxWidth: 400 }}>
          <Paragraph 
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            style={{ marginBottom: 0 }}
          >
            <ContentPreview 
              contentId={record.content_id} 
              contentType={record.content_type} 
            />
          </Paragraph>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Flagged {formatDistanceToNow(new Date(record.created_at))} ago
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: string) => getReasonTag(reason),
    },
    {
      title: 'Type',
      dataIndex: 'content_type',
      key: 'type',
      width: 100,
      render: (type: string) => getContentTypeTag(type),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 50,
      render: (_: any, record: any) => (
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

  if (isError) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>Failed to load flagged content. Please try again later.</span>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <FlagOutlined /> {status === 'pending' ? 'Pending' : 'Resolved'} Flags
        </Title>
        <Text type="secondary">
          {status === 'pending' 
            ? 'Review and take action on flagged content' 
            : 'History of resolved flags'}
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          ...pagination,
          total: data?.pagination?.total || 0,
          showSizeChanger: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />

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
          type: action === 'delete' ? 'primary' : 'default'
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
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder="Add a note about this action..."
        />
      </Modal>
    </div>
  );
}
