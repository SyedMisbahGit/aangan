import type { Meta, StoryObj } from '@storybook/react';
import { DreamHeader } from './DreamHeader';

const meta: Meta<typeof DreamHeader> = {
  title: 'Components/DreamHeader',
  component: DreamHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onLogin: { action: 'login' },
    onSignup: { action: 'signup' },
    onLogout: { action: 'logout' },
  },
};

export default meta;
type Story = StoryObj<typeof DreamHeader>;

export const LoggedOut: Story = {
  args: {
    isAuthenticated: false,
    user: null,
  },
};

export const LoggedIn: Story = {
  args: {
    isAuthenticated: true,
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
  },
};

export const WithNotification: Story = {
  args: {
    isAuthenticated: true,
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    notificationCount: 3,
  },
};

export const MobileView: Story = {
  args: {
    isAuthenticated: true,
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
