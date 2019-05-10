export enum WTagGroupType {
  A = 0,
  Text = 1,
  Ruby = 2,
}

export interface WTagGroup {
  type: WTagGroupType;
  charCount: number[] | [number | number];
}

export class WTagGroupA implements WTagGroup {
  public charCount: [number | number];
  public charCountCompress: [number | number];
  public type: WTagGroupType = WTagGroupType.A;
}
export class WTagGroupText implements WTagGroup {
  public charCountCompress: [number | number];
  public charCount: [number | number];
  public type: WTagGroupType = WTagGroupType.Text;
}
export class WTagGroupRuby implements WTagGroup {
  public charCountCompress: [number | number];
  public charCount: [number | number];
  public type: WTagGroupType = WTagGroupType.Ruby;
}
