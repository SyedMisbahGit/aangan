import { useState, useMemo } from 'react';
import { Table, Input, Button, Space, Tag, Typography, Card, Modal, Form, Select, message } from 'antd';
import { SearchOutlined, UserDeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, suspendUser, unsuspendUser, getUserSuspensions } from '../../../services/moderation.service';

const { Title, Text } = Typography;
const { Option } = Select;

type UserStatus = 'active' | 'suspended' | 'all';

const UserManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [suspensionModal, setSuspensionModal] = useState({ visible: false, userId: '', userName: '' });
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch users with filters
  const { data, isLoading } = useQuery({
    queryKey: ['moderationUsers', { searchText, statusFilter, ...pagination }],
    queryFn: () => getUsers({ 
      search: searchText,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: pagination.current,
      limit: pagination.pageSize,
    }),
  });

  // Suspend/unsuspend user mutation
  const toggleSuspension = useMutation({
    mutationFn: ({ userId, action, reason, durationDays } : { userId: string, action: 'suspend' | 'unsuspend', reason: string, durationDays?: number }) =>
      action === 'suspend' 
        ? suspendUser(userId, reason, durationDays)
        : unsuspendUser(userId, reason),
    onSuccess: () => {
      message.success(`User ${suspensionModal.visible ? 'suspended' : 'unsuspended'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['moderationUsers'] });
      setSuspensionModal({ ...suspensionModal, visible: false });
      form.resetFields();
    },
  });

  const columns = [
    {
      title: 'User',
      dataIndex: 'username',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <div>{record.display_name || record.username}</div>
            <Text type="secondary">@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email: string) => email || '—',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Tag color={record.is_suspended ? 'error' : 'success'}>
          {record.is_suspended ? 'Suspended' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type={record.is_suspended ? 'default' : 'primary'}
          danger={!record.is_suspended}
          size="small"
          onClick={() => {
            if (record.is_suspended) {
              toggleSuspension.mutate({ 
                userId: record.id, 
                action: 'unsuspend',
                reason: 'Manual unsuspend' 
              });
            } else {
              setSuspensionModal({ 
                visible: true, 
                userId: record.id, 
                userName: record.display_name || record.username 
              });
            }
          }}
        >
          {record.is_suspended ? 'Unsuspend' : 'Suspend'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>User Management</Title>
        <Text type="secondary">Manage user accounts and suspensions</Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Statuses</Option>
            <Option value="active">Active</Option>
            <Option value="suspended">Suspended</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={data?.items || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            ...pagination,
            total: data?.pagination?.total || 0,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </Card>

      <Modal
        title={`Suspend User: ${suspensionModal.userName}`}
        open={suspensionModal.visible}
        onCancel={() => setSuspensionModal({ ...suspensionModal, visible: false })}
        onOk={() => form.submit()}
        confirmLoading={toggleSuspension.isLoading}
      >
        <Form
          form={form}
          onFinish={(values) => {
            toggleSuspension.mutate({
              userId: suspensionModal.userId,
              action: 'suspend',
              reason: values.reason,
              durationDays: values.duration,
            });
          }}
          layout="vertical"
        >
          <Form.Item
            name="reason"
            label="Reason for Suspension"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter the reason for suspension" />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Duration (days)"
            extra="Leave empty for permanent suspension"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g., 7" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
