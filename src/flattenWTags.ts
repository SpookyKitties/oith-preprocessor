import { queryVerses } from './verses';

export function copyAttributes(from: Element, to: Element): void {
  Array.from(from.attributes).forEach(
    (attr): void => {
      if (attr && !to.hasAttribute(attr.name)) {
        // console.log(attr);

        if (attr.value === 'href' && from.hasAttribute('a2')) {
          const regex = new RegExp(
            `/(?<=(scriptures\/.+?\/)).+?\/[\S]+(?=\.html)/d`,
          );
          const newHref = regex.exec(attr.value);

          to.setAttribute(
            attr.name.replace('href', 'href'),
            newHref.toString(),
          );
        } else {
          {
            to.setAttribute(attr.name.replace('href', 'ref'), attr.value);
          }
        }
      }
    },
  );
}

export function removeRubyInAElements(document: Document): void {
  const verseElements = queryVerses(document);

  verseElements.forEach(
    (verseElement): void => {
      const aRubys2 = verseElement.querySelectorAll('a[href*=".."] ruby');
      Array.from(aRubys2).map(
        (a): void => {
          a.setAttribute('a2', 'true');
        },
      );
      const aRubys = verseElement.querySelectorAll(
        'a[href*="#"] ruby,a[href*=".."] ruby',
      );

      aRubys.forEach(
        (aRuby): void => {
          const parentElement = aRuby.parentElement;
          Array.from(aRuby.parentElement.childNodes).forEach(
            (child): void => {
              if (child) {
                copyAttributes(aRuby.parentElement, child as Element);

                aRuby.parentElement.insertAdjacentElement(
                  'beforebegin',
                  child as Element,
                );
              }
            },
          );

          parentElement.remove();
        },
      );
    },
  );
}
