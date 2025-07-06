import React from 'react';
import { render, screen } from '@testing-library/react';
import WhisperCard from '../components/whisper/WhisperCard';

const mockWhisper = {
  id: 'test-whisper-1',
  content: 'This is a test whisper content',
  emotion: 'joy',
  timestamp: '2m ago',
  location: 'library',
  likes: 5,
  comments: 2,
  isAnonymous: true,
  tags: ['test'],
};

describe('WhisperCard', () => {
  it('renders without crashing', () => {
    render(<WhisperCard whisper={mockWhisper} />);
    expect(screen.getByText('This is a test whisper content')).toBeInTheDocument();
  });

  it('displays the whisper content', () => {
    render(<WhisperCard whisper={mockWhisper} />);
    expect(screen.getByText('This is a test whisper content')).toBeInTheDocument();
  });

  it('displays the emotion', () => {
    render(<WhisperCard whisper={mockWhisper} />);
    expect(screen.getByTestId('emotion-badge')).toHaveTextContent('joy');
  });

  it('displays the timestamp', () => {
    render(<WhisperCard whisper={mockWhisper} />);
    expect(screen.getByText('2m ago')).toBeInTheDocument();
  });
}); 