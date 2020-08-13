import React, { useEffect, useState } from 'react';
import { AppExtensionSDK } from 'contentful-ui-extensions-sdk';
import * as contentful from 'contentful';
import * as R from 'ramda';
import '@contentful/forma-36-fcss/dist/styles.css';

// Use components from Contentful's design system, Forma 36: https://ctfl.io/f36
import {
  List,
  ListItem,
  TextLink,
  Note,
  SkeletonRow,
  EmptyState,
  TableRow,
  Table,
  TableCell,
} from '@contentful/forma-36-react-components';
import { toLocalisedEntry, LocalisedEntry, itemLink } from './utils';
import { icons } from './icons';

export default function Translations({ sdk }: { sdk: AppExtensionSDK }) {
  console.log('SDK => ', sdk);
  const [missingEntries, setMissingEntries] = useState<LocalisedEntry[]>([]);
  const [error, setError] = useState<string>();
  const [isInitialized, setInitialized] = useState(false);

  const [isLoading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    console.log('Loading  missing Entries');
    loadMissingEntries();
  }, []);

  const loadMissingEntries = () => {
    try {
      const cdaReadOnlyToken = (R.propOr(
        null,
        'token',
        sdk.parameters.installation
      ) as unknown) as string;

      if (!cdaReadOnlyToken) {
        throw 'Please set valid content delivery api readonly token from Apps => Manage Apps => VRMobile missing translations => configure';
      }

      const client = contentful.createClient({
        space: sdk.ids.space,
        accessToken: cdaReadOnlyToken,
        environment: sdk.ids.environment,
      });

      client
        .getEntries({ content_type: 'localizationNamespace', locale: '*', limit: 1000 })
        .then((r) => r.items)
        .then((namespaces) => {
          return namespaces.filter(
            (n) => n.fields && R.hasPath(['fields', 'localizedEntries', 'fi'], n)
          );
        })
        .then((namespaces) =>
          R.flatten(namespaces.map((n) => R.path(['fields', 'localizedEntries', 'fi'], n)))
        )
        .then((items) => items.map((item) => toLocalisedEntry(item)))
        .then((entries) => entries.filter((entry) => entry.isMissingTranslation))
        .then((entries) => {
          setLoading(false);
          setMissingEntries(entries);
        })
        .catch((e) => {
          console.log('Error getting entries => ', e);
          setError((e && e.message) || 'Something went wrong');
        })
        .finally(() => {
          setLoading(false);
          setInitialized(true);
        });
    } catch (e) {
      setError(e.toString());
      setLoading(false);
      setInitialized(true);
    }
  };

  if (error) {
    return (
      <EmptyState
        descriptionProps={{
          text: error,
        }}
        headingProps={{
          text: 'Oops, Something Went Wrong',
        }}
      />
    );
  }

  const onOpenItem = (item: LocalisedEntry) => {
    const spaceId = sdk.ids.space;
    const envId = sdk.ids.environment;
    window.open(itemLink(item, envId, spaceId), '_blank');
  };

  if (isLoading || !isInitialized) {
    return <SkeletonRow columnCount={1} rowCount={10} />;
  }

  const totalItems = missingEntries.length;
  return (
    <>
      <Note noteType={totalItems > 0 ? 'negative' : 'positive'}>
        {totalItems > 0
          ? `Total ${totalItems} item(s) need translations (Refresh page to update)`
          : `All translations are in place!`}
      </Note>
      <div style={{ margin: 20 }}>
        {missingEntries.map((entry, idx) => (
          <div key={idx}>
            <TextLink onClick={() => onOpenItem(entry)}>
              <h1>{entry.key || 'UNKNOWN'}</h1>
            </TextLink>
            <List>
              {entry.values?.map((v, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <img src={icons[idx]} style={{ width: 35, height: 35 }} />
                  </TableCell>
                  <TableCell>{v || ''}</TableCell>
                </TableRow>
              ))}
            </List>
          </div>
        ))}
      </div>
    </>
  );
}
