import type { Meta, StoryObj } from '@storybook/react';

import { Toast } from '../components/Toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    description: 'Document exported successfully.'
  }
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Info: Story = {
  args: {
    tone: 'info',
    title: 'Heads up'
  }
};

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'All set'
  }
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Review required'
  }
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    title: 'Action blocked'
  }
};
