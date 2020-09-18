import React, { useEffect, useState } from 'react';
import { AppExtensionSDK } from 'contentful-ui-extensions-sdk';
import * as contentful from 'contentful';
import * as R from 'ramda';
import '@contentful/forma-36-fcss/dist/styles.css';

// Use components from Contentful's design system, Forma 36: https://ctfl.io/f36
import {
  List,
  TextLink,
  Note,
  SkeletonRow,
  EmptyState,
  TableRow,
  Table,
  TableCell,, Pill, Tag
} from '@contentful/forma-36-react-components';
import { toLocalisedEntry, LocalisedEntry, itemLink } from './utils';
import { icons } from './icons';

export default function Translations({ sdk }: { sdk: AppExtensionSDK }) {
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
        throw 'Please set valid content delivery api readonly token from Manage Apps => Configure';
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
          namespaces.map((n) => ({
            parentId: R.path(['sys', 'id'], n) as string,
            parentName: R.path(['fields', 'id', 'fi'], n) as string,
            entries: R.path(['fields', 'localizedEntries', 'fi'], n) as any[],
          }))
        )
        .then((nsItems) =>
          R.flatten(
            nsItems.map((nsItem) =>
              nsItem.entries.map((i) => toLocalisedEntry(i, nsItem.parentId, nsItem.parentName))
            )
          )
        )
        .then((entries) => entries.filter((entry) => entry.isMissingTranslation))
        .then((entries) => {
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

  const openLink = (itemId: string) => {
    const spaceId = sdk.ids.space;
    const envId = sdk.ids.environment;

    if (!itemId) {
      return undefined;
    }

    window.open(itemLink(itemId, envId, spaceId), '_blank');
  };

  const onOpenItem = (entry: LocalisedEntry) => {
    if (!entry || !entry.item) {
      return undefined;
    }
    const itemId = (R.path(['sys', 'id'], entry.item) as unknown) as string;
    openLink(itemId);
  };

  const onOpenParent = (entry: LocalisedEntry) => {
    if (!entry) {
      return undefined;
    }
    const itemId = (entry.parentId as unknown) as string;
    openLink(itemId);
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
            <TextLink className="title" onClick={() => onOpenItem(entry)}>
              <h2>{entry.key || 'UNKNOWN'}</h2>
            </TextLink>
            <TextLink onClick={() => onOpenParent(entry)}>
              <Tag>{`(Namespace: ${entry.parentName})`}</Tag>
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

//https://vasant-patel.github.io/contentful-missing-translations-app/
