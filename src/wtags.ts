import { queryVerses } from './verses';
import cuid from 'cuid';
import { uniq } from 'lodash';
import { writeFile } from 'fs-extra';
import { normalize } from 'path';

function getWTag(
  element: Element,
  test: { cssClasses: string[]; text: string; count: number }[],
  cssClasses: string[] | undefined,
): void {
  switch (element.nodeName) {
    case '#text': {
      // console.log(cssClasses);

      if (element.textContent) {
        element.textContent.split('').forEach(
          (c): void => {
            test.push({
              cssClasses: cssClasses,
              text: c,
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
              console.log(
                (newCssClassList = newCssClassList.concat(
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
                )),
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

async function groupWTags(
  test: { cssClasses: string[]; text: string; count: number }[],
): Promise<void> {
  const test2: { cssClasses: string; text: string; count: number }[] = [];
  test
    .filter(
      (t): boolean => {
        return t.cssClasses.length > 0;
      },
    )
    .forEach(
      (t): void => {
        t.cssClasses.forEach(
          (cssClass): void => {
            test2.push({
              cssClasses: cssClass,
              text: t.text,
              count: t.count,
            });
          },
        );
      },
    );

  const uniqClasses = uniq(
    test2.map(
      (t): string => {
        return t.cssClasses;
      },
    ),
  );
  const test3: { cssClasses: string; count: number[] }[] = [];

  uniqClasses.forEach(
    (uq): void => {
      test3.push({
        cssClasses: uq,
        count: uniq(
          test2
            .filter(
              (a): boolean => {
                return a.cssClasses === uq;
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

  console.log(test3);

  await writeFile(normalize(`./data/${cuid()}.json`), JSON.stringify(test3));
}

export function queryWTags(document: Document): void {
  Array.from(queryVerses(document)).forEach(
    async (verseElement): Promise<void> => {
      const test: { cssClasses: string[]; text: string; count: number }[] = [];
      getWTag(verseElement, test, undefined);
      groupWTags(test);
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
}
