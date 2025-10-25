import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Wizard } from '../components/Wizard';

const sampleSteps = [
  {
    id: 'step-1',
    title: 'Review template',
    description: 'Confirm the right organizational template before applying brand.',
    content: 'Ensure the layout matches the intended audience and region.'
  },
  {
    id: 'step-2',
    title: 'Apply brand styles',
    description: 'Apply typography, color, and master layouts from the brand kit.',
    content: 'Brand enforcement runs in a non-destructive preview first.'
  },
  {
    id: 'step-3',
    title: 'Validate accessibility',
    description: 'Run accessibility checks and fix contrast or alt text issues.',
    content: 'Accessibility summary must be clean before export.'
  }
];

const meta: Meta<typeof Wizard> = {
  title: 'Components/Wizard',
  component: Wizard
};

export default meta;

type Story = StoryObj<typeof Wizard>;

const WizardPlayground = () => {
  const [step, setStep] = useState(0);
  return (
    <Wizard
      steps={sampleSteps}
      currentStep={step}
      onStepChange={setStep}
      onFinish={() => setStep(0)}
    />
  );
};

export const Basic: Story = {
  render: () => <WizardPlayground />
};
