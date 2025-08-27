import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils/test-utils';

describe('Minimal Test', () => {
  it('should render a basic component', () => {
    render(<div>Test Component</div>);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});
