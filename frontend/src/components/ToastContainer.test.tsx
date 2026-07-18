import { render, screen, fireEvent } from '@testing-library/react';
import { ToastContainer } from '@/components/ToastContainer';

const dismissToastMock = jest.fn();

jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    toasts: [
      { id: 'toast-1', message: 'Seat reserved successfully', type: 'success' },
      { id: 'toast-2', message: 'Invalid email or password', type: 'error' },
    ],
    dismissToast: dismissToastMock,
  }),
}));

describe('ToastContainer', () => {
  beforeEach(() => {
    dismissToastMock.mockClear();
  });

  it('renders toast messages', () => {
    render(<ToastContainer />);

    expect(screen.getByText('Seat reserved successfully')).toBeInTheDocument();
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('dismisses a toast when close is clicked', () => {
    render(<ToastContainer />);

    fireEvent.click(screen.getAllByLabelText('Dismiss notification')[0]);

    expect(dismissToastMock).toHaveBeenCalledWith('toast-1');
  });
});
