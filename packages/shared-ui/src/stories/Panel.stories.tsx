import type { Meta, StoryObj } from '@storybook/react';

import { Panel } from '../components/Panel';

const meta: Meta<typeof Panel> = {
  title: 'Components/Panel',
  component: Panel,
  args: {
    title: 'Document insights',
    children: 'Apply brand assets and validate accessibility from this panel.'
  }
};

export default meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {};
