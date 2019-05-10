import { W } from './models/w';

export enum WTagGroupType {
  A = 0,
  Text = 1,
  Ruby = 2,
}
/// WTagGroups exist to provide a parent tag for the basic text groupings found in the document.
/*
  WTagGroups were necessitaed by the need to preserve some the existing structure found in the source files,
  without having to include the information as WTag information. During development of the WTags, two potentially
  huges problems arose: A and Ruby tags. Most of the scripture text is ultimately just text with some styling.
  Its styling and function are not dependent on the tag it is in. Any special styling can be provided by css.

  This is not the case with A and Ruby tags. The problems with WTags were discovered when trying to include A tags.
  Unlike other tags, A tags already do something when you click them. This meant that all of the WTag functions couldn't
  apply to them. They could pick up styling and maybe underlining, but they wouldn't support refs. WTags can very liberal
  in how they break up the text. Every single character in a verse can potentially have a unique set of WTags, and
  including the HREF of ATags in the WTags would mean potentially hundreds of single character A Tags on the page.
  HREF data can't be compressed, further adding to the data on page. So, while in theory it could work, it was decided that
  it would be better to try and preserve a single A Tag instead of breaking it up.

  Ruby tags are what cemented the idea. From their definition on W3Schools: "A ruby annotation is a small extra text,
  attached to the main text to indicate the pronunciation or meaning of the corresponding characters. This kind of
   annotation is often used in Japanese publications."  Unlike A tags, Ruby tags can't be broken up. Ruby tags are dependent on the structure
  <ruby><rb></rb><rt></rt></ruby>. A structure such as <ruby><rb></rb><rb></rb><rt></rt><rt></rt></ruby> or <ruby></ruby><ruby></ruby>
  would cause the characters to display incorrectly. Because of this, preserving this structure was critical




  ** It should be noted that the <rb></rb> part of the Ruby tag is not required. It is being preserved because of its use
  in the source documents. **

*/
export interface WTagGroup {
  type: WTagGroupType;
  charCount: number[] | undefined;
  charCountCompress: [number | number];
}

export class WTagGroupA implements WTagGroup {
  public charCount: [number | number] | undefined;
  public charCountCompress: [number | number];
  public type: WTagGroupType = WTagGroupType.A;
  public wTags: W[];
}
export class WTagGroupText implements WTagGroup {
  public charCountCompress: [number | number];
  public charCount: [number | number] | undefined;
  public type: WTagGroupType = WTagGroupType.Text;
  public wTags: W[];
}
export class WTagGroupRuby implements WTagGroup {
  public charCountCompress: [number | number];
  public charCount: [number | number] | undefined;
  public type: WTagGroupType = WTagGroupType.Ruby;
  public wRT: W[];
  public wRB: W[];
}
