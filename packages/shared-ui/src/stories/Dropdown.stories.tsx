import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Dropdown } from '../components/Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

const DropdownPlayground = () => {
  const [value, setValue] = useState('word');
  return (
    <Dropdown
      id="host-select"
      label="Choose host"
      value={value}
      onChange={(next) => setValue(next)}
      options={[
        { value: 'word', label: 'Word' },
        { value: 'ppt', label: 'PowerPoint' },
        { value: 'outlook', label: 'Outlook' }
      ]}
    />
  );
};

export const Basic: Story = {
  render: () => <DropdownPlayground />
};
