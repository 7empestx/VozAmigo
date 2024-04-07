import React, { useEffect, useState } from 'react';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import StatusIndicator, { StatusIndicatorProps } from '@cloudscape-design/components/status-indicator';
import Table, { TableProps } from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import { isVisualRefresh } from './../../common/apply-mode';
import { WidgetConfig } from '../interfaces';

export const clientsCultivated: WidgetConfig = {
  definition: { defaultRowSpan: 3, defaultColumnSpan: 2 },
  data: {
    icon: 'table',
    title: 'ClientsCultivated',
    description: 'View all Clients that are cultivated',
    disableContentPaddings: !isVisualRefresh,
    header: ClientsCultivatedHeader,
    content: ClientsCultivated,
    footer: ClientsCultivatedFooter,
  },
};

interface Item {
  business: string;
  email: string;
  name: string;
  phone: string;
  state: string;
}

function ClientsCultivatedHeader() {
  return (
    <Header
    >
      Clients Cultivated
    </Header>
  );
}

function ClientsCultivatedFooter() {
  return (
    <Box textAlign="center">
      <Link href="#" variant="primary">
        View all clients
      </Link>
    </Box>
  );
}

const clientsDefinition: TableProps<Item>['columnDefinitions'] = [
  {
    id: 'business',
    header: 'Business',
    cell: item => <Link href="#">{item.business}</Link>,
    isRowHeader: true,
  },
  {
    id: 'name',
    header: 'Name',
    cell: item => <Link href="#">{item.name}</Link>,
  },
  {
    id: 'email',
    header: 'Email',
    cell: item => <Link href="#">{item.email}</Link>,
  },
  {
    id: 'phone',
    header: 'Phone',
    cell: item => <Link href="#">{item.phone}</Link>,
  },
  {
    id: 'state',
    header: 'State',
    cell: item => <Link href="#"> {item.state} </Link>,
  },
];

const clientItems: TableProps<Item>['items'] = [
];

export default function ClientsCultivated() {
  const [clientItems, setClientItems] = useState<Item[]>([]);
  const xapikey = 'YsTDWpTnms79cPnelNqJY6KLj6cSl0B86fW6xOLH';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.clientcultivator.biz/lead', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "x-api-key": xapikey,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseJson = await response.json();
        if (Array.isArray(responseJson.data)) {
          console.log('Data is an array', responseJson);
          setClientItems(responseJson.data);
        } else {
          console.error('Data is not an array', responseJson);
        }
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Table
      variant="borderless"
      resizableColumns={true}
      items={clientItems}
      columnDefinitions={clientsDefinition}
      enableKeyboardNavigation={true}
    />
  );
}

