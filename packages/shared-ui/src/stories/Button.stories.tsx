import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    onClick: { action: 'clicked' }
  }
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Apply Brand'
  }
};

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: 'Continue'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Secondary Action'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Loading state'
  }
};
