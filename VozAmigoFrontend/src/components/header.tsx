import React from 'react';
import { HelpPanel, Header } from '@cloudscape-design/components';
import { ExternalLinkGroup, InfoLink, useHelpPanel } from '../commons';

export function DashboardMainInfo() {
  return (
    <HelpPanel
      header={<h2>Client Cultivator</h2>}
      footer={
        <ExternalLinkGroup
          items={[
            { href: '#', text: '' },
            { href: '#', text: '' },
            { href: '#', text: '' },
            { href: '#', text: '' },
            { href: '#', text: '' },
          ]}
        />
      }
    >
      <p>
        Client Cultivator is a service that helps you to cultivate your clients.
      </p>
    </HelpPanel>
  );
}

export function DashboardHeader({ actions }: { actions: React.ReactNode }) {
  const loadHelpPanelContent = useHelpPanel();
  return (
    <Header
      variant="h1"
      info={<InfoLink onFollow={() => loadHelpPanelContent(<DashboardMainInfo />)} />}
      actions={actions}
    >
     Client Cultivator
    </Header>
  );
}
