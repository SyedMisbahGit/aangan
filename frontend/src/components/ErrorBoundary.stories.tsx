import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './shared/ErrorBoundary';
import React from 'react';

// A component that will throw an error
const ErrorComponent = () => {
  throw new Error('This is a test error');
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component that catches JavaScript errors in its child component tree.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onReset: { action: 'reset' },
    children: {
      control: { type: 'text' },
      description: 'Child components to be rendered inside the error boundary.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  args: {
    children: 'This is a normal child component',
  },
};

export const WithError: Story = {
  args: {
    children: <ErrorComponent />,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the error boundary catching an error from a child component.',
      },
    },
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <ErrorComponent />,
    FallbackComponent: ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
      <div style={{ padding: '1rem', border: '1px solid #ff6b6b', borderRadius: '4px' }}>
        <h3>Custom Error UI</h3>
        <p>Something went wrong:</p>
        <pre style={{ color: 'red' }}>{error.message}</pre>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'This story shows a custom fallback UI when an error is caught.',
      },
    },
  },
};
