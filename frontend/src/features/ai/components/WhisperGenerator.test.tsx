import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../test-utils/testing-library-utils';
import WhisperGenerator from './WhisperGenerator';
import { generateWhisper, analyzeSentiment } from '../aiService';
import userEvent from '@testing-library/user-event';

// Mock the AI service
jest.mock('../aiService', () => ({
  generateWhisper: jest.fn(),
  analyzeSentiment: jest.fn(),
}));

// Mock the toast notification
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('WhisperGenerator', () => {
  const mockOnGenerate = jest.fn();
  
  const mockWhisperResponse = {
    id: 'whisper-ai-123',
    content: 'This is a generated whisper based on your input.',
    isPublic: true,
    tags: ['ai-generated', 'suggestion'],
    sentiment: {
      score: 0.8,
      label: 'positive',
    },
  };
  
  const mockSentimentResponse = {
    sentiment: {
      score: 0.9,
      label: 'very_positive',
      emotions: ['joy', 'excitement'],
    },
  };
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (generateWhisper as jest.Mock).mockResolvedValue(mockWhisperResponse);
    (analyzeSentiment as jest.Mock).mockResolvedValue(mockSentimentResponse);
  });
  
  it('renders the whisper generator form', () => {
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    // Check form elements
    expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/make public/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
  });
  
  it('validates the prompt input', async () => {
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    
    // Try to submit with empty prompt
    fireEvent.click(generateButton);
    
    // Check for validation error
    expect(await screen.findByText(/prompt is required/i)).toBeInTheDocument();
    
    // Enter a valid prompt
    const promptInput = screen.getByLabelText(/prompt/i);
    userEvent.type(promptInput, 'Write an encouraging message');
    
    // Submit the form
    fireEvent.click(generateButton);
    
    // Check that the API was called
    await waitFor(() => {
      expect(generateWhisper).toHaveBeenCalledWith(
        'Write an encouraging message',
        expect.objectContaining({
          isPublic: true,
          tags: [],
        })
      );
    });
  });
  
  it('calls the onGenerate callback with the generated whisper', async () => {
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    // Fill in the form
    const promptInput = screen.getByLabelText(/prompt/i);
    userEvent.type(promptInput, 'Write an encouraging message');
    
    // Toggle the public switch
    const publicSwitch = screen.getByLabelText(/make public/i);
    fireEvent.click(publicSwitch);
    
    // Add some tags
    const tagsInput = screen.getByLabelText(/tags/i);
    userEvent.type(tagsInput, 'encouragement, motivation{enter}');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    
    // Check that the API was called with the correct parameters
    await waitFor(() => {
      expect(generateWhisper).toHaveBeenCalledWith(
        'Write an encouraging message',
        {
          isPublic: false, // Toggled off
          tags: ['encouragement', 'motivation'],
        }
      );
      
      // Check that the onGenerate callback was called with the result
      expect(mockOnGenerate).toHaveBeenCalledWith(mockWhisperResponse);
    });
  });
  
  it('shows a loading state while generating', async () => {
    // Make the API call take some time
    (generateWhisper as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockWhisperResponse), 500))
    );
    
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    // Fill in the form and submit
    userEvent.type(screen.getByLabelText(/prompt/i), 'Test prompt');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    
    // Check that the button shows a loading state
    const generateButton = screen.getByRole('button', { name: /generating.../i });
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
    
    // Wait for generation to complete
    await waitFor(() => {
      expect(generateButton).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });
  });
  
  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to generate whisper';
    (generateWhisper as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    // Mock console.error to avoid error logs in test output
    const originalError = console.error;
    console.error = jest.fn();
    
    // Mock toast.error
    const mockToastError = jest.fn();
    toast.error = mockToastError;
    
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    // Fill out the form
    const promptInput = screen.getByLabelText(/prompt/i);
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    
    // Check that an error toast was shown
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        `Failed to generate whisper: ${errorMessage}`,
        expect.any(Object)
      );
    });
    
    console.error = originalError;
  });
  
  it('analyzes sentiment when the analyze button is clicked', async () => {
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    // Enter some text
    const promptInput = screen.getByLabelText(/prompt/i);
    const testText = 'I am so excited about this feature!';
    userEvent.type(promptInput, testText);
    
    // Click the analyze button
    fireEvent.click(screen.getByRole('button', { name: /analyze sentiment/i }));
    
    // Check that the sentiment analysis API was called
    await waitFor(() => {
      expect(analyzeSentiment).toHaveBeenCalledWith(testText);
    });
    
    // Check that the sentiment is displayed
    expect(await screen.findByText(/sentiment: very_positive/i)).toBeInTheDocument();
    expect(screen.getByText(/confidence: 90%/i)).toBeInTheDocument();
  });
  
  it('shows a preview of the generated whisper', async () => {
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    // Generate a whisper
    userEvent.type(screen.getByLabelText(/prompt/i), 'Test prompt');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    
    // Check that the preview is shown with the generated content
    expect(await screen.findByText(/preview/i)).toBeInTheDocument();
    expect(screen.getByText(mockWhisperResponse.content)).toBeInTheDocument();
    
    // Check that the sentiment analysis is shown
    expect(screen.getByText(/sentiment: positive/i)).toBeInTheDocument();
    
    // Check that the tags are displayed
    mockWhisperResponse.tags.forEach(tag => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument();
    });
  });
  
  it('allows editing the generated whisper before submission', async () => {
    render(<WhisperGenerator onGenerate={mockOnGenerate} />);
    
    // Generate a whisper
    userEvent.type(screen.getByLabelText(/prompt/i), 'Original prompt');
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    
    // Wait for generation to complete
    const previewContent = await screen.findByText(mockWhisperResponse.content);
    
    // Click the edit button
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    // The form should be populated with the generated content
    const contentTextarea = screen.getByLabelText(/whisper content/i);
    expect(contentTextarea).toHaveValue(mockWhisperResponse.content);
    
    // Edit the content
    const editedContent = 'This is my edited content';
    userEvent.clear(contentTextarea);
    userEvent.type(contentTextarea, editedContent);
    
    // Submit the edited whisper
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Check that onGenerate was called with the edited content
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          content: editedContent,
        })
      );
    });
  });
});
