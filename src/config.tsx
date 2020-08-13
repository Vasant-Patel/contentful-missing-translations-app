import React, { useEffect, useState } from 'react';
import { AppExtensionSDK } from 'contentful-ui-extensions-sdk';
import * as R from 'ramda';
// Use components from Contentful's design system, Forma 36: https://ctfl.io/f36
import { TextField } from '@contentful/forma-36-react-components';

interface State {
  token: string;
}

export default function Config({ sdk }: { sdk: AppExtensionSDK }) {
  const [token, setToken] = useState('');

  const configure = () => {
    console.log('On configure called returning => ', token);
    return {
      // Parameters to be persisted as the app configuration.
      parameters: token ? { token } : { token: '' },
    };
  };

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("OnTextChange => ", e)
    const updatedValue = e.target.value;
    console.log('updated Value => ', updatedValue);
    setToken(updatedValue);
    console.log('Params after setParams => ', token);
  };

  useEffect(() => {
    sdk.app.onConfigure(configure);
  }, [token]);

  useEffect(() => {
    // Ready to display our app (end loading state).
    sdk.app.getParameters().then((parameters) => {
      console.log('Setting app ready in config screen with params ! => ', parameters);
      const token = (R.propOr('', 'token', parameters || {}) as unknown) as string;
      setToken(token);
      sdk.app.setReady();
    });
  }, []);

  return (
    <div style={{ margin: 50 }}>
      <TextField
        name="tokenInput"
        id="tokenInput"
        value={token}
        onChange={onTextChange}
        labelText="Contentful Delivery Token (Readonly token)"></TextField>
    </div>
  );
}
