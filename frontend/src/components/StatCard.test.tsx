import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Concerts" value={5} tone="orange" />);

    expect(screen.getByText('Total Concerts')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies tone class', () => {
    const { container } = render(
      <StatCard label="Available Seats" value={12} tone="green" />,
    );

    expect(container.querySelector('.stat-card-green')).toBeInTheDocument();
  });
});
