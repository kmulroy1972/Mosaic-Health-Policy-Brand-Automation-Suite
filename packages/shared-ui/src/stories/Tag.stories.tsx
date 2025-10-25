import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from '../components/Tag';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Neutral: Story = {
  args: {
    tone: 'neutral',
    children: 'Org Asset'
  }
};

export const Success: Story = {
  args: {
    tone: 'success',
    children: 'Compliant'
  }
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    children: 'Review'
  }
};

export const Danger: Story = {
  args: {
    tone: 'danger',
    children: 'Blocked'
  }
};
