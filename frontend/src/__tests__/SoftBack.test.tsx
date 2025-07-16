import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import SoftBack from '../components/shared/SoftBack';
import { vi } from 'vitest';
import { describe, it, expect } from 'vitest';

// Use typeof import for type safety
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('SoftBack', () => {
  it('renders and triggers navigate(-1) on click', () => {
    const navigate = vi.fn();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(navigate);
    const { getByText } = render(
      <MemoryRouter>
        <SoftBack />
      </MemoryRouter>
    );
    const button = getByText('← Back');
    fireEvent.click(button);
    expect(navigate).toHaveBeenCalledWith(-1);
  });
}); 