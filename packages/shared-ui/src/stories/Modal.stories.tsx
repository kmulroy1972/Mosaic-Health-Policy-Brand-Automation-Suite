import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof Modal>;

const ModalStory = () => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ minHeight: '200px' }}>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} title="Confirm export" onClose={() => setOpen(false)}>
        <p>Export the branded document as PDF/A-2b with accessibility validation.</p>
      </Modal>
    </div>
  );
};

export const Basic: Story = {
  render: () => <ModalStory />
};
