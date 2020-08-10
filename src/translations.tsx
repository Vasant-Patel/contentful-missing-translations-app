import React, { useEffect } from 'react';
import { AppExtensionSDK } from 'contentful-ui-extensions-sdk';

// Use components from Contentful's design system, Forma 36: https://ctfl.io/f36
import { Paragraph } from '@contentful/forma-36-react-components';

export default function Translations({ sdk }: { sdk: AppExtensionSDK }) {
  useEffect(() => {
  }, []);

  return RenderMissingTranslations({sdk})
}


function RenderMissingTranslations({ sdk }: { sdk: AppExtensionSDK }) {

  return <Paragraph>Missing Translations coming soon!!</Paragraph>;
}
