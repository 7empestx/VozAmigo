import React from 'react';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Box from '@cloudscape-design/components/box';
import { isVisualRefresh } from './../../common/apply-mode';
import { WidgetConfig } from '../interfaces';

export const personalizedLearningPath: WidgetConfig = {
  definition: { defaultRowSpan: 3, defaultColumnSpan: 2 },
  data: {
    icon: 'table',
    title: 'PersonalizedLearningPath',
    description: 'Personalized Learning Path',
    disableContentPaddings: !isVisualRefresh,
    header: PersonalizedLearningPathHeader,
    content: PersonalizedLearningPath,
    footer: PersonalizedLearningPathFooter,
  },
};

function PersonalizedLearningPathHeader() {
  return (
    <Header
    >
      Personalized Learning Path
    </Header>
  );
}

function PersonalizedLearningPathFooter() {
  return (
    <Box textAlign="center">
      <Link href="#" variant="primary">
        View More
      </Link>
    </Box>
  );
}

export default function PersonalizedLearningPath() {
}

