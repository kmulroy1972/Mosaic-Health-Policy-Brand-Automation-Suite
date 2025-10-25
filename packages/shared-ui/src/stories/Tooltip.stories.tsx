import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Top: Story = {
  render: () => (
    <Tooltip content="Use this to apply the official template." placement="top">
      <Button variant="ghost">Hover me</Button>
    </Tooltip>
  )
};

export const Bottom: Story = {
  render: () => (
    <Tooltip content="PDF export includes accessibility report." placement="bottom">
      <Button variant="ghost">Focus me</Button>
    </Tooltip>
  )
};
