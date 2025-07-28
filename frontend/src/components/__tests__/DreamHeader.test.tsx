import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../__tests__/test-utils';
import { DreamHeader } from '../shared/DreamHeader';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser' },
    signOut: jest.fn(),
  }),
}));

describe('DreamHeader', () => {
  it('renders the logo and navigation links', () => {
    renderWithProviders(<DreamHeader />);
    
    // Check for logo
    expect(screen.getByAltText('WhisperVerse Logo')).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('shows user menu when avatar is clicked', () => {
    renderWithProviders(<DreamHeader />);
    
    // Click on the avatar
    const avatar = screen.getByAltText('User avatar');
    fireEvent.click(avatar);
    
    // Check if user menu is shown
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls signOut when Sign Out is clicked', () => {
    const { useAuth } = jest.requireMock('../../hooks/useAuth');
    const { signOut } = useAuth();
    renderWithProviders(<DreamHeader />);
    
    // Open user menu
    const avatar = screen.getByAltText('User avatar');
    fireEvent.click(avatar);
    
    // Click Sign Out
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
    
    // Check if signOut was called
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('shows mobile menu when menu button is clicked', () => {
    // Mock window.innerWidth to simulate mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    // Trigger window resize event
    window.dispatchEvent(new Event('resize'));
    
    renderWithProviders(<DreamHeader />);
    
    // Check if menu button is visible
    const menuButton = screen.getByLabelText('Open main menu');
    expect(menuButton).toBeInTheDocument();
    
    // Click menu button
    fireEvent.click(menuButton);
    
    // Check if mobile menu is shown
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
});
