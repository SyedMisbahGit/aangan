import React from 'react';
import { render, screen } from '@testing-library/react';
import WhisperCard from '../components/whisper/WhisperCard';
import { describe, it, expect } from 'vitest';

const mockWhisper = {
  id: 'test-whisper-1',
  content: 'This is a test whisper content',
  emotion: 'joy',
  timestamp: new Date().toISOString(),
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

  it('displays the timestamp', () => {
    render(<WhisperCard whisper={mockWhisper} />);
    // Update: check for 'a moment ago' instead of '2m ago'
    expect(screen.getByText('a moment ago')).toBeInTheDocument();
  });
}); 