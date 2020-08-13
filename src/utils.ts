import * as R from 'ramda';
const tags = ['[EN]', '[FI]', '[SV]'];

export const EntryLink = "https://app.contentful.com/spaces/SPACE_ID/environments/ENV_ID/entries/ENTRY_ID"


export interface LocalisedEntry {
  item: any;
  key?: string;
  values?: string[];
  isMissingTranslation: boolean;
}

export const toLocalisedEntry = (item: any): LocalisedEntry => {
  const key = (R.path(['fields', 'id', 'fi'], item) as unknown) as string;
  const fiValue: string = (R.path(['fields', 'text', 'fi'], item) as unknown) as string;
  const enValue: string = (R.path(['fields', 'text', 'en'], item) as unknown) as string;
  const svValue: string = (R.path(['fields', 'text', 'sv'], item) as unknown) as string;
  const values = [fiValue, enValue, svValue];


  const isMissingTranslation =
    R.isNil(key) ||
    R.any((v) => R.isNil(v) || R.isEmpty(v), values) ||
    R.any((v) => R.any((tag) => v.includes(tag), tags), values);


  return { item, key, values, isMissingTranslation };
};


export const itemLink = (entry: LocalisedEntry, envId: string, spaceId: string): string | undefined => {

  if (!entry || !entry.item) {
    return undefined;
  }

  const ENTRY_ID = (R.path(['sys', 'id'], entry.item) as unknown) as string;

  if (!ENTRY_ID) {
    return undefined;
  }

  const data = { ENTRY_ID, 'ENV_ID': envId, 'SPACE_ID': spaceId };
  const link =  EntryLink.replace(/SPACE_ID|ENTRY_ID|ENV_ID/gi, (match => data[match]));
  console.log("ENTRY LINK IS => ", link)
  return link;

}
