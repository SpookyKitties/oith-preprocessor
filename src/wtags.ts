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
      // console.log(cssClasses);

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
            : []; // ;
          // console.log((child as Element).className);

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
            // console.log();
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

  // console.log(test3);

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

export async function queryWTags(document: Document): Promise<void> {
  const verses: { id: string; test3: PreWStage4[] }[] = [];

  const p: Promise<void>[] = [];
  Array.from(queryVerses(document)).forEach(
    async (verseElement): Promise<void> => {
      p.push(preWTagProccess(verseElement, verses));
      // console.log(
      //   test
      //     .filter(
      //       (t): boolean => {
      //         return t.cssClasses.length > 0;
      //       },
      //     )
      //     .map(t => {
      //       return t.cssClasses.map(c => {
      //         return c;
      //       });
      //     }),
      // );
      // console.log(test);

      // console.log(
      //   Array.from(verseElement.childNodes).map(
      //     (childNode): string => {
      //       return childNode.nodeName;
      //     },
      //   ),
      // );
    },
  );
  await Promise.all(p);
  await writeFile(normalize(`./data/${cuid()}.json`), JSON.stringify(verses));

  // console.log(verses);
}
