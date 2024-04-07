import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { AppLayoutProps } from '@cloudscape-design/components/app-layout';
import Button from '@cloudscape-design/components/button';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Grid from '@cloudscape-design/components/grid';

import '@cloudscape-design/global-styles/dark-mode-utils.css';
import './styles/base.scss';

import { DashboardHeader, DashboardMainInfo } from './components/header';
import { CustomAppLayout } from './commons/common-components';
import { DashboardSideNavigation } from './components/side-navigation';
import { Breadcrumbs, Notifications, HelpPanelProvider } from './commons';
import {
  BaseStaticWidget,
  personalizedLearningPath,
  interactiveExercises,
  realWorldScenarios,
  adaptiveFeedback,
  culturalImmersion,
} from './widgets';

function Content() {
  return (
    <Grid
      gridDefinition={[
        { colspan: { l: 12, m: 12, default: 12 } },
        { colspan: { l: 12, m: 12, default: 12 } },
        { colspan: { l: 12, m: 12, default: 12 } },
        { colspan: { l: 12, m: 12, default: 12 } },
        { colspan: { l: 12, m: 12, default: 12 } },
      ]}
    >
      {[
        personalizedLearningPath,
        interactiveExercises,
        realWorldScenarios,
        adaptiveFeedback,
        culturalImmersion,
      ].map((widget, index) => (
        <BaseStaticWidget key={index} config={widget.data} />
      ))}
    </Grid>
  );
}

export default function App() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsContent, setToolsContent] = useState<React.ReactNode>(() => <DashboardMainInfo />);
  const appLayout = useRef<AppLayoutProps.Ref>(null);

  const handleToolsContentChange = (content: React.ReactNode) => {
    setToolsOpen(true);
    setToolsContent(content);
    appLayout.current?.focusToolsClose();
  };

  return (
    <HelpPanelProvider value={handleToolsContentChange}>
      <CustomAppLayout
        ref={appLayout}
        content={
          <ContentLayout header={<DashboardHeader actions={<Button variant="primary">Support Voz Amigo</Button>} />}>
            <Content />
          </ContentLayout>
        }
        breadcrumbs={<Breadcrumbs items={[{ text: 'Dashboard', href: '#/' }]} />}
        navigation={<DashboardSideNavigation />}
        tools={toolsContent}
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        notifications={<Notifications />}
      />
    </HelpPanelProvider>
  );
}

createRoot(document.getElementById('app')!).render(<App />);
