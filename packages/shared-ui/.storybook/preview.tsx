import type { Preview } from '@storybook/react';
import React from 'react';

import { SharedUiProvider } from '../src/provider';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'surface',
      values: [
        { name: 'surface', value: '#f5f7fa' },
        { name: 'contrast', value: '#003057' }
      ]
    },
    options: {
      storySort: {
        order: ['Foundations', 'Components']
      }
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          }
        ]
      }
    }
  },
  decorators: [
    (Story) => (
      <SharedUiProvider>
        <div style={{ padding: '2rem' }}>
          <Story />
        </div>
      </SharedUiProvider>
    )
  ]
};

export default preview;
