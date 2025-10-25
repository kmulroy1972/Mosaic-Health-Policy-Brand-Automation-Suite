import type { Meta, StoryObj } from '@storybook/react';

import { ProgressBar } from '../components/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  args: {
    label: 'Export progress'
  }
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Determinate: Story = {
  args: {
    value: 60
  }
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true
  }
};
