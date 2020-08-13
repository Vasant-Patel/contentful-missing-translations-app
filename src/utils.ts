import * as R from 'ramda';
const tags = ['[EN]', '[FI]', '[SV]'];

export const EntryLink = "https://app.contentful.com/spaces/SPACE_ID/environments/master/entries/ENTRY_ID"


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


export const itemLink = (entry: LocalisedEntry): string | undefined => {

  if (!entry || !entry.item) {
    return undefined;
  }

  const SPACE_ID = (R.path(['sys', 'space', 'sys', 'id'], entry.item) as unknown) as string;
  const ENTRY_ID = (R.path(['sys', 'id'], entry.item) as unknown) as string;

  if (!SPACE_ID || !ENTRY_ID) {
    return undefined;
  }

  const data = { ENTRY_ID, SPACE_ID };

  const link =  EntryLink.replace(/SPACE_ID|ENTRY_ID/gi, (match => data[match]));
  console.log("ENTRY LINK IS => ", link)
  return link;

}
