import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Toggle } from '../components/Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    onChange: { action: 'change' }
  }
};

export default meta;

type Story = StoryObj<typeof Toggle>;

const TogglePlayground = () => {
  const [value, setValue] = useState(true);
  return (
    <Toggle
      checked={value}
      onChange={(checked) => setValue(checked)}
      label="Enable PDF/A conversion"
    />
  );
};

export const Controlled: Story = {
  render: () => <TogglePlayground />
};
