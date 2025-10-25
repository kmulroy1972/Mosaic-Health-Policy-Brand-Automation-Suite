import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import { FirstRunTour } from '../components/FirstRunTour';
import { writePreference } from '../storage/indexedDb';

const steps = [
  {
    title: 'Choose an official template',
    description: 'Start from the Organizational Assets library to guarantee brand compliance.'
  },
  {
    title: 'Apply the brand controls',
    description: 'Map document regions and enforce headers, footers, and approved styles.'
  },
  {
    title: 'Validate accessibility',
    description: 'Confirm alt text, contrast, and tagging before exporting a PDF.'
  }
];

const meta: Meta<typeof FirstRunTour> = {
  title: 'Components/FirstRunTour',
  component: FirstRunTour,
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;

type Story = StoryObj<typeof FirstRunTour>;

const TourStory = () => {
  const storageKey = 'tour_story';

  useEffect(() => {
    void writePreference(storageKey, false);
  }, [storageKey]);

  return <FirstRunTour steps={steps} storageKey={storageKey} />;
};

export const Default: Story = {
  render: () => <TourStory />
};
