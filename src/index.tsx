import React from 'react';
import { render } from 'react-dom';

// Use the Contentful's App SDK to get access to the web app.
// Reference: https://ctfl.io/app-sdk
import { init, locations, AppExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';

import Config from './config';
import './index.css';
import Translations from './translations';

// You can render different components for each location in the Contentful web app.
// Learn more about all app locations here: https://ctfl.io/app-locations
init((sdk) => {
  const root = document.getElementById('root');
  console.log("SDK => ", sdk)

  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    render(<Config sdk={sdk as AppExtensionSDK} />, root);
  } else {
    render(<Translations sdk={sdk as AppExtensionSDK} />, root);
  }
});

