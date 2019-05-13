export interface W {
  charCount: [number, number][];
  optional: boolean | undefined;
  wType: WType;
  text: string | undefined;
  verseID: string;
}

export enum WType {
  Base = 0,
  RichText = 1,
  Highlight = 2,
  Underline = 3,
  Refs = 4,
  Poetry = 5,
  Link = 6,
  RubyRB = 7,
  RubyRT = 8,
}
export enum NoteType {
  New = 1,
  Eng = 2,
  TC = 3,
}

export class BaseW implements W {
  public verseID: string;
  public charCount: [number, number][];
  public optional: boolean;
  public wType: WType = WType.Base;
  public text: string;
}

export enum RichText {
  verseNumber = 0,

  clarityWord,
  translit,
  language,
  deityName,
  smallCaps,
  uppercase,
  entry,
  closing,
  signature,
  shortTitle,
  break,
  salutation,
  office,
  date,
  addressee,
  answer,
  question,
  line,
  paraMark,
  selah,
}
export enum Poetry {
  Poetry = 0,
  Prose = 1,
}

export enum Color {}

export class WRef implements W {
  public verseID: string;
  public charCount: [number, number][];
  public optional: boolean;
  public wType: WType = WType.Refs;
  public text: string | undefined;
  public ref: string;
  public noteType: NoteType;
}

export class WRichText implements W {
  public verseID: string;
  public charCount: [number, number][];
  public optional: boolean;
  public wType: WType = WType.RichText;
  public text: string | undefined;
  public richText: RichText;
}

export class WHighlight implements W {
  public verseID: string;
  public charCount: [number, number][];
  public optional: boolean;
  public wType: WType = WType.Highlight;
  public text: string | undefined;
  public color: Color;
}

export class WUnderline implements W {
  public verseID: string;
  public charCount: [number, number][];
  public optional: boolean;
  public wType: WType = WType.Underline;
  public text: string | undefined;
}

export class WPoetry implements W {
  public verseID: string;
  public charCount: [number, number][];
  public optional: boolean;
  public wType: WType;
  public text: string | undefined;
  public poetry: Poetry;
}

export class WLink implements W {
  public verseID: string;
  public charCount: [number, number][];
  public optional: boolean;
  public wType: WType = WType.Link;
  public text: string | undefined;
}
