import { useState } from 'react';
import { Table, Tag, Button, Typography, Card, Space, Modal, Form, Input, message } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserSuspensions, unsuspendUser } from '../../../services/moderation.service';
import { formatDistanceToNow, format } from 'date-fns';

const { Title, Text } = Typography;
const { confirm } = Modal;

const SuspensionsList = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [unsuspendModal, setUnsuspendModal] = useState({
    visible: false,
    suspensionId: '',
    userName: '',
  });
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch suspensions
  const { data, isLoading, isError } = useQuery({
    queryKey: ['userSuspensions', pagination],
    queryFn: () => getUserSuspensions({
      page: pagination.current,
      limit: pagination.pageSize,
    }),
    keepPreviousData: true,
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: ({ suspensionId, reason }: { suspensionId: string; reason: string }) =>
      unsuspendUser(suspensionId, reason),
    onSuccess: () => {
      message.success('User unsuspended successfully');
      queryClient.invalidateQueries({ queryKey: ['userSuspensions'] });
      queryClient.invalidateQueries({ queryKey: ['moderationUsers'] });
      setUnsuspendModal({ ...unsuspendModal, visible: false });
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to unsuspend user');
    },
  });

  const handleUnsuspend = (suspensionId: string, userName: string) => {
    setUnsuspendModal({ visible: true, suspensionId, userName });
  };

  const handleUnsuspendSubmit = (values: any) => {
    unsuspendUserMutation.mutate({
      suspensionId: unsuspendModal.suspensionId,
      reason: values.reason,
    });
  };

  const showConfirmUnsuspend = (suspension: any) => {
    confirm({
      title: `Unsuspend ${suspension.user_name}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to unsuspend this user?',
      okText: 'Yes, unsuspend',
      okType: 'primary',
      cancelText: 'No, keep suspended',
      onOk() {
        handleUnsuspend(suspension.id, suspension.user_name);
      },
    });
  };

  const getStatusTag = (suspension: any) => {
    const isActive = suspension.is_active && 
      (!suspension.ends_at || new Date(suspension.ends_at) > new Date());
    
    if (!isActive) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Ended
        </Tag>
      );
    }
    
    const isPermanent = !suspension.ends_at;
    
    if (isPermanent) {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          Permanent
        </Tag>
      );
    }
    
    const endDate = new Date(suspension.ends_at);
    const timeLeft = formatDistanceToNow(endDate, { addSuffix: true });
    
    return (
      <Tag icon={<ClockCircleOutlined />} color="warning">
        Active - {timeLeft}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c8c8c'
            }}>
              <UserOutlined />
            </div>
          </div>
          <div>
            <div>{record.user_name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user_email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => getStatusTag(record),
    },
    {
      title: 'Suspended By',
      dataIndex: 'moderator_name',
      key: 'moderator',
      render: (moderator: string, record: any) => (
        <div>
          <div>{moderator || 'System'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {format(new Date(record.created_at), 'PPpp')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => reason || '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        const isActive = record.is_active && 
          (!record.ends_at || new Date(record.ends_at) > new Date());
        
        if (!isActive) return null;
        
        return (
          <Button
            type="link"
            onClick={() => showConfirmUnsuspend(record)}
            loading={unsuspendUserMutation.isLoading && unsuspendUserMutation.variables?.suspensionId === record.id}
          >
            Unsuspend
          </Button>
        );
      },
    },
  ];

  if (isError) {
    return (
      <Card>
        <Title level={4}>Suspension History</Title>
        <div style={{ marginTop: 16 }}>
          <p>Failed to load suspension history. Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Suspension History</Title>
          <Text type="secondary">
            View and manage all user suspensions
          </Text>
        </div>
      </div>

      <Card>
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
              `${range[0]}-${range[1]} of ${total} suspensions`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </Card>

      <Modal
        title={`Unsuspend User: ${unsuspendModal.userName}`}
        open={unsuspendModal.visible}
        onCancel={() => setUnsuspendModal({ ...unsuspendModal, visible: false })}
        onOk={() => form.submit()}
        confirmLoading={unsuspendUserMutation.isLoading}
      >
        <Form
          form={form}
          onFinish={handleUnsuspendSubmit}
          layout="vertical"
        >
          <Form.Item
            name="reason"
            label="Reason for Unsuspension"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter the reason for unsuspending this user" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuspensionsList;
