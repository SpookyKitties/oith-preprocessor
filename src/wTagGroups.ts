import cuid from 'cuid';
import { W } from './models/w';
import { queryVerses, convertTextNodeToNode, getElementIds } from './verses';
import { writeFileSync } from 'fs-extra';
import { normalize } from 'path';

export enum WTagGroupType {
  A = 0,
  Text = 1,
  Ruby = 2,
  ARuby = 3,
  RB = 4,
  RT = 5,
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
  public wRT: [number, number];
  public wRB: [number, number];
}

export class WTagGroupRubyA implements WTagGroup {
  public charCountCompress: [number | number];
  public charCount: [number | number] | undefined;
  public type: WTagGroupType = WTagGroupType.Ruby;
  public preRubyText: [number, number] | undefined;
  public postRubyText: [number, number] | undefined;
  public wRT: [number, number];
  public wRB: [number, number];
}

class PreWTagGroup1 {
  public classList: string[] | undefined;
  public childNodes: Node[] = [];
  public length: number = 0;
  public id: string;
  public type: WTagGroupType;
}
class PreWTagGroup2 {
  public classList: string[] | undefined;
  public charCount: [number, number]; //= 0;
  public type: WTagGroupType;
  public id: string;
}

function getPreWTagGroup1Type(node: Node): WTagGroupType {
  switch (node.nodeName) {
    case 'A': {
      if ((node as Element).querySelectorAll('ruby').length > 0) {
        return WTagGroupType.ARuby;
      } else {
        return WTagGroupType.A;
      }
    }
    case 'RUBY': {
      return WTagGroupType.Ruby;
    }

    default:
      return WTagGroupType.Text;
  }
}

function nodeToPreWGroup1(node: Node, verse: Element): PreWTagGroup1 {
  let preWTagGroup1: PreWTagGroup1 = new PreWTagGroup1();

  preWTagGroup1 = new PreWTagGroup1();
  preWTagGroup1.id = verse.id;
  // preWTagGroup1.childNodes.push(node);
  preWTagGroup1.length = node.textContent.length;
  preWTagGroup1.classList = verse.className.split(' ');
  preWTagGroup1.type = getPreWTagGroup1Type(node);
  return preWTagGroup1;
}

function parseGroups(verse: Element): PreWTagGroup1[] {
  const preWTagGroup1s: PreWTagGroup1[] = [];

  let preWTagGroup1: PreWTagGroup1 | undefined;

  verse.childNodes.forEach(
    (child): void => {
      switch (child.nodeName) {
        case 'A':
        case 'RUBY': {
          if (preWTagGroup1) {
            preWTagGroup1s.push(preWTagGroup1);
          }
          preWTagGroup1s.push(nodeToPreWGroup1(child, verse));
          break;
        }

        default: {
          if (preWTagGroup1) {
            preWTagGroup1.length =
              preWTagGroup1.length + child.textContent.length;
          } else {
            preWTagGroup1 = nodeToPreWGroup1(child, verse);
          }
          break;
        }
      }

      // if (!preWTagGroup1) {
      //   preWTagGroup1 = new PreWTagGroup1();
      //   preWTagGroup1.id = verse.id;
      //   preWTagGroup1.childNodes.push(child);
      //   preWTagGroup1.classList = verse.className.split(' ');
      //   preWTagGroup1.type = getPreWTagGroup1Type(child);

      //   if (
      //     child.nodeName === 'A' ||
      //     child.nodeName === 'RUBY' ||
      //     (child as Element).hasAttribute('href')
      //   ) {
      //     preWTagGroup1s.push(preWTagGroup1);
      //     preWTagGroup1 = undefined;
      //   }
      // } else if (preWTagGroup1) {
      //   switch (child.nodeName) {
      //     case 'A':
      //     case 'RUBY': {
      //       // console.log('hggg');
      //       // preWTagGroup1.id = verse.id;
      //       preWTagGroup1s.push(preWTagGroup1);
      //       preWTagGroup1 = undefined;
      //       preWTagGroup1s.push({
      //         classList: child.parentElement.className.split(' '),
      //         childNodes: [child],
      //         length: 0,
      //         id: verse.id,
      //         type: getPreWTagGroup1Type(child),
      //       });
      //       break;
      //     }

      //     default: {
      //       if ((child as Element).hasAttribute('href')) {
      //         preWTagGroup1s.push(preWTagGroup1);
      //         preWTagGroup1s.push({
      //           classList: child.parentElement.className.split(' '),
      //           childNodes: [child],
      //           length: 0,
      //           id: verse.id,
      //           type: getPreWTagGroup1Type(child),
      //         });
      //       } else {
      //         preWTagGroup1.classList = child.parentElement.className.split(
      //           ' ',
      //         );
      //         preWTagGroup1.childNodes.push(child);
      //       }
      //       break;
      //     }
      //   }
      // }
    },
  );

  if (preWTagGroup1) {
    // console.log(preWTagGroup1.childNodes.length);
    preWTagGroup1s.push(preWTagGroup1);
  }
  return preWTagGroup1s;
}

function parseWTagStep1(document: Document): PreWTagGroup1[] {
  let preWTagGroup1s: PreWTagGroup1[] = [];
  const verses = queryVerses(document);
  verses.forEach(
    (verse): void => {
      convertTextNodeToNode(document, verse);
      preWTagGroup1s = preWTagGroup1s.concat(parseGroups(verse));
    },
  );
  // preWTagGroup1s.forEach(
  //   (preWTagGroup1): void => {
  //     const length = preWTagGroup1.childNodes
  //       .map(
  //         (p): number => {
  //           return p.textContent.length;
  //         },
  //       )
  //       .reduce(
  //         (p, c): number => {
  //           return p + c;
  //         },
  //       );
  //     preWTagGroup1.length = length;
  //   },
  // );
  return preWTagGroup1s;
  // writeFileSync(
  //   normalize(`./data/${cuid()}.json`),
  //   JSON.stringify(
  //     preWTagGroup1s.map(child => {
  //       return {
  //         classList: child.classList,
  //         length: child.length,
  //         id: child.id,
  //         // chlid: child.childNodes.map(c => {
  //         //   return (c as Element).outerHTML;
  //         // }),
  //       };
  //     }),
  //   ),
  // );
}

function parseWTagGroupStrp2(
  verseIds: string[],
  preWTagGroup1s: PreWTagGroup1[],
): void {
  const preWTagGroup2s: PreWTagGroup2[] = [];
  verseIds.map(
    (verseId): void => {
      let count = 0;
      preWTagGroup1s
        .filter(
          (preWTagGroup1): boolean => {
            return preWTagGroup1.id === verseId;
          },
        )
        .map(
          (preWTagGroup1): void => {
            const preWTagGroup2: PreWTagGroup2 = new PreWTagGroup2();
            preWTagGroup2.charCount = [count, count + preWTagGroup1.length];
            count = count + preWTagGroup1.length + 1;
            preWTagGroup2.classList = preWTagGroup1.classList;
            preWTagGroup2.id = preWTagGroup1.id;
            preWTagGroup2.type = preWTagGroup1.type;
            // console.log(preWTagGroup1.type);

            preWTagGroup2s.push(preWTagGroup2);
          },
        );
    },
  );

  console.log(`${preWTagGroup1s.length}  ${preWTagGroup2s.length}`);

  writeFileSync(
    normalize(`./data/${cuid()}.json`),
    JSON.stringify(preWTagGroup2s),
  );
  // getEkementIds()
}

export function parseWTagGroups(document: Document): WTagGroup[] {
  console.log(document.querySelectorAll('ruby[href]').length);

  const preWTagGroup1s = parseWTagStep1(document);
  // const preWTagGroup2 =
  parseWTagGroupStrp2(
    getElementIds(Array.from(queryVerses(document))),
    preWTagGroup1s,
  );
  // console.log(preWTagGroup2);

  const wTagGroups: WTagGroup[] = [];

  return wTagGroups;
}

// Array.from(document.querySelector('#p2').childNodes)
//   .filter(child => {
//     return child.nodeName === 'W';
//   })
//   .forEach(child => {
//     Array.from(child.childNodes)
//       .filter(d => {
//         return d.nodeName !== '#text';
//       })
//       .forEach(c => {
//         child.parentElement.insertBefore(c, child);
//       });
//   });

// Array.from(document.querySelector('a ruby').parentElement.attributes).forEach(
//   attr => {
//     const ruby = document.querySelector('a ruby');
//     if (ruby && attr) {
//       ruby.setAttribute(attr.name, attr.value);
//
//     }
//   },
// );

// document.querySelectorAll('ruby').forEach(ruby => {
//
// });
