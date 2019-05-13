import { WTagGroup } from '../wTagGroups';
import { W } from './w';

export class Verse {
  public _id: string;
  public _rev: string | undefined;
  public wTagGroups: WTagGroup[];
  public classList: string[] | undefined;
  public text: string;
  public wTags: W[];
}
