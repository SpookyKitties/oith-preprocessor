import { queryVerses } from './verses';
import cuid from 'cuid';
import { uniq, first } from 'lodash';
import { writeFile } from 'fs-extra';
import { normalize } from 'path';
import {
  filteredUndefined as filterUndefined,
  getRanges,
  nodeListOfToArray,
} from './shared';

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

class WTagStage1 {
  public verseID: string;
  public classList: string[];
  public characterCount: number[] | number | [number, number][];
  public text: string;
}

function getNewClassList(child: Element, newCssClassList: string[]): string[] {
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

          // console.log(newCssClassList);
        }
      },
    );
  return newCssClassList;
}
function childToWTags(
  child: Element,
  wTagStage1: WTagStage1[],
  verseID: string,
  classList: string[] = [],
): void {
  switch (child.nodeName) {
    case '#text': {
      child.textContent.split('').map(
        (c): void => {
          wTagStage1.push({
            classList: classList,
            verseID: verseID,
            characterCount: [wTagStage1.length],
            text: c,
          });
        },
      );
      break;
    }

    default: {
      let newCssClassList: string[] = classList;
      newCssClassList = getNewClassList(child, newCssClassList);
      nodeListOfToArray(child.childNodes).map(
        (child2): void => {
          childToWTags(child2 as Element, wTagStage1, verseID, newCssClassList);
        },
      );
      break;
    }
  }
}

/*
  splitWTags splits out the classlists into individual wTags.
*/
function splitWTags(wTagStage1: WTagStage1[]): void {
  wTagStage1
    .filter(
      (w): boolean => {
        return w.classList.length > 1;
      },
    )
    .map(
      (w2): void => {
        w2.classList.map(
          (m): void => {
            wTagStage1.push({
              classList: [m],
              characterCount: w2.characterCount,
              verseID: w2.verseID,
              text: w2.text,
            });
          },
        );
      },
    );
}

/**
 *
 * @param wTagStage1 Takes the wTags made from splitWTags and each classList every character count number that has that class
 */

function compressWTags(wTagStage1: WTagStage1[]): WTagStage1[] {
  const newWTagStage1: WTagStage1[] = [];
  filterUndefined(
    uniq(
      wTagStage1.map(
        (w): string => {
          return w.classList[0];
        },
      ),
    ),
  ).map(
    (i): void => {
      const wTagStage1Filtered = wTagStage1.filter(
        (w): boolean => {
          return w.classList.includes(i);
        },
      );
      const wTag = first(wTagStage1Filtered);

      newWTagStage1.push({
        classList: [i],
        characterCount: getRanges(
          wTagStage1Filtered.map(
            (w): number => {
              return w.characterCount[0];
            },
          ),
        ),
        text: wTag.text,
        verseID: wTag.verseID,
      });
    },
  );

  return newWTagStage1;
}

function verseToWTags(verseElement: Element): WTagStage1[] {
  const wTagStage1: WTagStage1[] = [];
  nodeListOfToArray(verseElement.childNodes).map(
    (child): void => {
      childToWTags(child as Element, wTagStage1, verseElement.id);
    },
  );
  splitWTags(wTagStage1);
  return compressWTags(
    wTagStage1.filter(
      (w): boolean => {
        return w.classList.length === 1;
      },
    ),
  );
  // return wTagStage1.filter(
  //   (w): boolean => {
  //     return w.classList.length === 1;
  //   },
  // );
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
