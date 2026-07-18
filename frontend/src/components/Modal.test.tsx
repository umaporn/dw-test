import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/Modal';

describe('Modal', () => {
  it('does not render when closed', () => {
    render(
      <Modal open={false} title="Create concert" onClose={jest.fn()}>
        <p>Form content</p>
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title and content when open', () => {
    render(
      <Modal open title="Delete concert" onClose={jest.fn()}>
        <p>Are you sure?</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete concert')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();

    render(
      <Modal open title="Create concert" onClose={onClose}>
        <p>Form content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();

    render(
      <Modal open title="Create concert" onClose={onClose}>
        <p>Form content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    const onClose = jest.fn();

    render(
      <Modal open title="Create concert" onClose={onClose}>
        <p>Form content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText('Form content'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
