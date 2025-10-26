import type { RewriteRequestInput, RewriteResponse } from '@mhp/shared-brand-core';
import type { Meta, StoryObj } from '@storybook/react';

import { BrandSafeRewritePanel } from '../components/BrandSafeRewritePanel';

const meta: Meta<typeof BrandSafeRewritePanel> = {
  title: 'Components/BrandSafeRewritePanel',
  component: BrandSafeRewritePanel,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    onApply: { action: 'apply' },
    onRewriteComplete: { action: 'rewriteComplete' }
  }
};

export default meta;

type Story = StoryObj<typeof BrandSafeRewritePanel>;

const mockRewrite = async (payload: RewriteRequestInput): Promise<RewriteResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    text: `${payload.text}\n\n[Rewritten with goals: ${payload.goal?.join(', ') || 'n/a'}]`,
    modelId: 'mock-model',
    tokenUsage: {
      promptTokens: 250,
      completionTokens: 120
    }
  };
};

export const Playground: Story = {
  args: {
    initialText:
      'We appreciate your partnership. Please confirm receipt of the attached briefing by Friday.',
    brandTerms: ['MHP', 'Azure OpenAI'],
    submitRewrite: mockRewrite
  }
};
