import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../test-utils/testing-library-utils';
import userEvent from '@testing-library/user-event';
import ReportContent from './ReportContent';
import { reportContent } from '../moderationService';
import { ReportReason } from '../moderationService';

// Mock the moderation service
jest.mock('../moderationService', () => ({
  ...jest.requireActual('../moderationService'),
  reportContent: jest.fn(),
  ReportReason: {
    INAPPROPRIATE: 'inappropriate',
    HARASSMENT: 'harassment',
    SPAM: 'spam',
    OTHER: 'other',
  },
}));

// Mock the toast notification
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ReportContent', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  
  const defaultProps = {
    contentId: 'whisper-123',
    contentType: 'whisper',
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };
  
  const mockReportResponse = {
    id: 'report-456',
    contentId: 'whisper-123',
    contentType: 'whisper',
    reason: ReportReason.INAPPROPRIATE,
    status: 'pending',
    reportedBy: 'user-789',
    reportedAt: new Date().toISOString(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (reportContent as jest.Mock).mockResolvedValue(mockReportResponse);
  });
  
  it('renders the report dialog with all options', () => {
    render(<ReportContent {...defaultProps} />);
    
    // Check dialog title
    expect(screen.getByText(/report content/i)).toBeInTheDocument();
    
    // Check reason options
    expect(screen.getByLabelText(/inappropriate content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/harassment or bullying/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/spam or scam/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit report/i })).toBeInTheDocument();
  });
  
  it('requires a reason to be selected', async () => {
    render(<ReportContent {...defaultProps} />);
    
    // Try to submit without selecting a reason
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    // Check for validation error
    expect(await screen.findByText(/please select a reason/i)).toBeInTheDocument();
    expect(reportContent).not.toHaveBeenCalled();
  });
  
  it('shows additional context field when "Other" is selected', async () => {
    render(<ReportContent {...defaultProps} />);
    
    // Select "Other" reason
    const otherOption = screen.getByLabelText(/other/i);
    userEvent.click(otherOption);
    
    // Additional context field should be visible
    const contextField = await screen.findByLabelText(/please specify/i);
    expect(contextField).toBeInTheDocument();
    
    // Try to submit without providing context
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    // Should show validation error for missing context
    expect(await screen.findByText(/please provide more details/i)).toBeInTheDocument();
    
    // Fill in the context
    userEvent.type(contextField, 'This is a custom reason');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    // Check that the API was called with the correct data
    await waitFor(() => {
      expect(reportContent).toHaveBeenCalledWith({
        contentId: 'whisper-123',
        contentType: 'whisper',
        reason: 'other',
        additionalContext: 'This is a custom reason',
      });
    });
  });
  
  it('submits the report with the selected reason', async () => {
    render(<ReportContent {...defaultProps} />);
    
    // Select a reason
    const reasonOption = screen.getByLabelText(/inappropriate content/i);
    userEvent.click(reasonOption);
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    // Check that the API was called with the correct data
    await waitFor(() => {
      expect(reportContent).toHaveBeenCalledWith({
        contentId: 'whisper-123',
        contentType: 'whisper',
        reason: 'inappropriate',
      });
    });
    
    // Check that onSuccess was called
    expect(mockOnSuccess).toHaveBeenCalledWith(mockReportResponse);
    
    // Check that success toast was shown
    const { toast } = require('react-toastify');
    expect(toast.success).toHaveBeenCalledWith(
      'Content reported successfully',
      expect.any(Object)
    );
  });
  
  it('calls onCancel when the cancel button is clicked', () => {
    render(<ReportContent {...defaultProps} />);
    
    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Check that onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to submit report';
    (reportContent as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    // Mock console.error to avoid error logs in test output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ReportContent {...defaultProps} />);
    
    // Select a reason and submit
    userEvent.click(screen.getByLabelText(/inappropriate content/i));
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    // Check that error toast was shown
    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast.error).toHaveBeenCalledWith(
        `Failed to report content: ${errorMessage}`,
        expect.any(Object)
      );
    });
    
    consoleError.mockRestore();
  });
  
  it('shows a loading state while submitting', async () => {
    // Make the API call take some time
    (reportContent as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockReportResponse), 500))
    );
    
    render(<ReportContent {...defaultProps} />);
    
    // Select a reason and submit
    userEvent.click(screen.getByLabelText(/inappropriate content/i));
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    // Check that the button shows a loading state
    const submitButton = screen.getByRole('button', { name: /submitting.../i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Check that the cancel button is disabled during submission
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit report/i })).toBeInTheDocument();
    });
  });
  
  it('displays a success message after successful submission', async () => {
    render(<ReportContent {...defaultProps} showSuccessMessage />);
    
    // Select a reason and submit
    userEvent.click(screen.getByLabelText(/inappropriate content/i));
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }));
    
    // Check that the success message is displayed
    expect(await screen.findByText(/thank you for your report/i)).toBeInTheDocument();
    expect(screen.getByText(/we have received your report/i)).toBeInTheDocument();
    
    // Check that the close button is shown
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
    
    // Click the close button
    fireEvent.click(closeButton);
    
    // Check that onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('pre-fills the form when initialValues are provided', () => {
    const initialValues = {
      reason: 'harassment',
      additionalContext: 'This user is harassing me',
    };
    
    render(
      <ReportContent 
        {...defaultProps} 
        initialValues={initialValues} 
      />
    );
    
    // Check that the reason is pre-selected
    expect(screen.getByLabelText(/harassment or bullying/i)).toBeChecked();
    
    // Check that additional context is pre-filled
    expect(screen.getByLabelText(/additional context/i)).toHaveValue(
      'This user is harassing me'
    );
  });
  
  it('allows customizing the title and description', () => {
    const customProps = {
      ...defaultProps,
      title: 'Report this post',
      description: 'Please let us know why you are reporting this post.',
    };
    
    render(<ReportContent {...customProps} />);
    
    // Check custom title and description
    expect(screen.getByText('Report this post')).toBeInTheDocument();
    expect(
      screen.getByText('Please let us know why you are reporting this post.')
    ).toBeInTheDocument();
  });
});
