import React from 'react';
import { render, screen, waitFor } from '../../test-utils/testing-library-utils';
import { WebSocketProvider, useWebSocket } from './WebSocketContext';
import { WebSocketStub } from '../../test-utils/testing-library-utils';

// Test component that uses the WebSocket hook
const TestComponent = () => {
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [messages, setMessages] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (lastMessage) {
      setMessages(prev => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  return (
    <div>
      <div data-testid="connection-status">
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <button 
        onClick={() => sendMessage({ type: 'PING', payload: 'Hello' })}
        data-testid="send-button"
      >
        Send Ping
      </button>
      <div data-testid="messages">
        {messages.map((msg, i) => (
          <div key={i} data-testid="message">
            {JSON.stringify(msg)}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('WebSocket Context', () => {
  let mockWebSocket: WebSocketStub;
  
  beforeEach(() => {
    // Reset the mock WebSocket before each test
    // @ts-ignore
    mockWebSocket = new WebSocketStub('ws://test');
  });
  
  afterEach(() => {
    // Clean up any mock implementations
    jest.clearAllMocks();
  });
  
  it('should establish WebSocket connection on mount', async () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );
    
    // Wait for connection to be established
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });
    
    // Verify the WebSocket was created with the correct URL
    expect(mockWebSocket.url).toBe('ws://localhost:3001/ws');
  });
  
  it('should send messages through WebSocket', async () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );
    
    // Wait for connection
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });
    
    // Send a message
    const sendButton = screen.getByTestId('send-button');
    sendButton.click();
    
    // Verify the message was sent
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'PING', payload: 'Hello' })
    );
  });
  
  it('should receive messages from WebSocket', async () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );
    
    // Wait for connection
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });
    
    // Simulate receiving a message
    const testMessage = { type: 'PONG', payload: 'Hello back!' };
    mockWebSocket.mockMessage(testMessage);
    
    // Verify the message was received and displayed
    await waitFor(() => {
      const messages = screen.getAllByTestId('message');
      expect(messages[messages.length - 1]).toHaveTextContent(
        JSON.stringify(testMessage)
      );
    });
  });
  
  it('should handle WebSocket errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );
    
    // Wait for connection
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });
    
    // Simulate an error
    mockWebSocket.simulateError();
    
    // Verify error handling
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    });
    
    consoleError.mockRestore();
  });
  
  it('should reconnect when connection is lost', async () => {
    // Mock setTimeout to control the reconnection delay
    jest.useFakeTimers();
    
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );
    
    // Wait for initial connection
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });
    
    // Close the connection
    mockWebSocket.close();
    
    // Fast-forward time to trigger reconnection
    jest.advanceTimersByTime(5000);
    
    // Verify reconnection was attempted
    expect(mockWebSocket.close).toHaveBeenCalled();
    
    // Clean up timers
    jest.useRealTimers();
  });
  
  it('should authenticate with the WebSocket server', async () => {
    // Mock the Redux store with an authenticated user
    const preloadedState = {
      auth: {
        user: {
          id: 'user-123',
          token: 'test-token',
        },
      },
    };
    
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>,
      { preloadedState }
    );
    
    // Wait for connection
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });
    
    // Verify the authentication message was sent
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'AUTH',
        payload: { token: 'test-token' },
      })
    );
  });
});
