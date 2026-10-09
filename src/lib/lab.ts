import { getCollection, type CollectionEntry } from 'astro:content';
import { LAYER_IDS, type LayerId } from '../data/layers';
import { isPreview } from '../data/site';
import { isVisible, sortLab } from './lab-utils';

export type LabEntry = CollectionEntry<'lab'>;

export async function getLab(): Promise<LabEntry[]> {
  const all = await getCollection('lab');
  return sortLab(all.filter((e) => isVisible(e.data.status, isPreview)), LAYER_IDS);
}

export function labForLayer(entries: LabEntry[], id: LayerId): LabEntry[] {
  return entries.filter((e) => e.data.layer === id);
}
