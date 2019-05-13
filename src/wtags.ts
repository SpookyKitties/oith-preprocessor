import { queryVerses } from './verses';
import cuid from 'cuid';
import { uniq } from 'lodash';
import { writeFile } from 'fs-extra';
import { normalize } from 'path';

export class PreWStage1 {
  public attributes: string[];
  public count: number;
}
export class PreWStage2 {
  public attributes: string;
  public count: number;
}
export class PreWStage3 {
  public attributes: string;
  public count: number[];
}
export class PreWStage4 {
  public attributes: string;
  public count: [number, number][];
}

function getWTag(
  element: Element,
  test: PreWStage1[],
  cssClasses: string[] | undefined,
): void {
  switch (element.nodeName) {
    case '#text': {
      if (element.textContent) {
        element.textContent.split('').forEach(
          (c): void => {
            c = c;
            test.push({
              attributes: cssClasses,
              count: test.length,
            });
          },
        );
      }
      break;
    }
    default: {
      element.childNodes.forEach(
        (child): void => {
          let newCssClassList: string[] = (child as Element).className
            ? (child as Element).className.split(' ')
            : [];

          if (cssClasses) {
            newCssClassList = cssClasses.concat(newCssClassList);
          }
          try {
            if ((child as Element).attributes)
              newCssClassList = newCssClassList.concat(
                Array.from((child as Element).attributes)
                  .filter(
                    (d): boolean => {
                      return d.name !== 'n';
                    },
                  )
                  .map(
                    (d): string => {
                      return d.value;
                    },
                  ),
              );
          } catch (error) {
            console.log(error);
          }

          getWTag(child as Element, test, newCssClassList);
        },
      );
      break;
    }
  }
}

async function groupWTags(test: PreWStage1[]): Promise<PreWStage3[]> {
  const test2: PreWStage2[] = [];
  test
    .filter(
      (t): boolean => {
        return t.attributes.length > 0;
      },
    )
    .forEach(
      (t): void => {
        t.attributes.forEach(
          (cssClass): void => {
            test2.push({
              attributes: cssClass,
              count: t.count,
            });
          },
        );
      },
    );

  const uniqClasses = uniq(
    test2.map(
      (t): string => {
        return t.attributes;
      },
    ),
  );
  const test3: PreWStage3[] = [];

  uniqClasses.forEach(
    (uq): void => {
      test3.push({
        attributes: uq,
        count: uniq(
          test2
            .filter(
              (a): boolean => {
                return a.attributes === uq;
              },
            )
            .map(
              (t): number => {
                return t.count;
              },
            ),
        ),
      });
    },
  );

  return test3;
}

function stage4(s3s: PreWStage3[]): PreWStage4[] {
  const s4s: PreWStage4[] = [];
  s3s.forEach(
    (s3): void => {
      const s4: PreWStage4 = { attributes: s3.attributes, count: [] };
      let first: number | undefined;
      let last: number | undefined;
      s3.count.forEach(
        (c): void => {
          if (!first) {
            first = c;
          } else if (first && !last) {
            if (first + 1 === c) {
              last = c;
            } else {
              s4.count.push([first, first]);
              first = c;
            }
          } else if (first && last) {
            if (last + 1 === c) {
              last = c;
            } else {
              s4.count.push([first, last]);
              first = c;
              last = undefined;
            }
          }
        },
      );

      if (first && last) {
        s4.count.push([first, last]);
      } else if (first && !last) {
        s4.count.push([first, first]);
      }

      s4s.push(s4);
    },
  );
  return s4s;
}

async function preWTagProccess(
  verseElement: Element,
  verses: { id: string; test3: PreWStage4[] }[],
): Promise<void> {
  const test: PreWStage1[] = [];
  getWTag(verseElement, test, undefined);
  const test3 = await groupWTags(test);
  const s4 = stage4(test3);
  verses.push({ id: verseElement.id, test3: s4 });
}

export async function queryWTags2(document: Document): Promise<void> {
  const verses: { id: string; test3: PreWStage4[] }[] = [];

  const p: Promise<void>[] = [];
  Array.from(queryVerses(document)).forEach(
    async (verseElement): Promise<void> => {
      p.push(preWTagProccess(verseElement, verses));
    },
  );
  await Promise.all(p);
  await writeFile(normalize(`./data/${cuid()}.json`), JSON.stringify(verses));
}

function nodeListOfToArray<T extends Node>(nodeListOf: NodeListOf<T>): T[] {
  return Array.from(nodeListOf);
}

class WTagStage1 {
  public verseID: string;
  public classList: string[];
}

function childToWTags(
  child: Element,
  wTagStage1: WTagStage1[],
  verseID: string,
  classList: string[] = [],
): void {
  switch (child.nodeName) {
    case '#text': {
      wTagStage1.push({ classList: classList, verseID: verseID });
      break;
    }

    default: {
      let newCssClassList: string[] = classList;
      Array.from(child.attributes)
        .filter(
          (attr): boolean => {
            return attr.name !== 'n';
          },
        )
        .map(
          (attr): void => {
            if (attr.name.toLowerCase() === 'classname') {
              newCssClassList = newCssClassList.concat(attr.value.split(' '));
            } else {
              newCssClassList = newCssClassList.concat(attr.value.split(','));
              console.log(attr.value.split(','));
              console.log(newCssClassList);

              // console.log(newCssClassList);
            }
          },
        );
      nodeListOfToArray(child.childNodes).map(
        (child2): void => {
          childToWTags(child2 as Element, wTagStage1, verseID, newCssClassList);
        },
      );
      break;
    }
  }
}

function verseToWTags(verseElement: Element): WTagStage1[] {
  const wTagStage1: WTagStage1[] = [];
  nodeListOfToArray(verseElement.childNodes).map(
    (child): void => {
      childToWTags(child as Element, wTagStage1, verseElement.id);
    },
  );
  return wTagStage1;
}

export async function queryWTags(document: Document): Promise<void> {
  const verseElements = nodeListOfToArray(queryVerses(document));
  verseElements.map(
    async (verseElement): Promise<void> => {
      await writeFile(
        normalize(`./data/${cuid()}-w2.json`),
        JSON.stringify(verseToWTags(verseElement)),
      );
    },
  );
}
