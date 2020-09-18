import * as R from 'ramda';
const tags = ['[EN]', '[FI]', '[SV]'];

export const EntryLink =
  'https://app.contentful.com/spaces/SPACE_ID/environments/ENV_ID/entries/ENTRY_ID';

export interface LocalisedEntry {
  item: any;
  key?: string;
  values?: string[];
  isMissingTranslation: boolean;
  parentId?: string;
  parentName?: string;
}

export const toLocalisedEntry = (item: any, parentId?: string, parentName?: string): LocalisedEntry => {
  const key = (R.path(['fields', 'id', 'fi'], item) as unknown) as string;
  const fiValue: string = (R.pathOr('', ['fields', 'text', 'fi'], item) as unknown) as string;
  const enValue: string = (R.pathOr('', ['fields', 'text', 'en'], item) as unknown) as string;
  const svValue: string = (R.pathOr('', ['fields', 'text', 'sv'], item) as unknown) as string;
  const acceptEmpty: boolean = (R.pathOr(
    false,
    ['fields', 'acceptEmpty', 'fi'],
    item
  ) as unknown) as boolean;

  const values = [fiValue, enValue, svValue];

  const isMissingTranslation =
    R.isNil(key) ||
    (acceptEmpty ? false : R.any((v) => R.isNil(v) || R.isEmpty(v), values)) ||
    R.any((v) => R.any((tag) => v.includes(tag), tags), values);

  return { item, key, values, isMissingTranslation, parentId, parentName };
};

export const itemLink = (
  itemId: string,
  envId: string,
  spaceId: string
): string | undefined => {

  if (!itemId) {
    return undefined;
  }

  const data: { [key: string]: string } = { ENTRY_ID: itemId, ENV_ID: envId, SPACE_ID: spaceId };
  const link = EntryLink.replace(/SPACE_ID|ENTRY_ID|ENV_ID/gi, (match) => data[match]);
  return link;
};
