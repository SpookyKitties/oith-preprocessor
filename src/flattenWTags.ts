import { queryVerses } from './verses';

export function copyAttributes(from: Element, to: Element): void {
  Array.from(from.attributes).forEach(
    (attr): void => {
      if (attr && !to.hasAttribute(attr.name)) {
        // console.log(attr);

        to.setAttribute(attr.name.replace('href', 'ref'), attr.value);
      }
    },
  );
}

export function removeRubyInAElements(document: Document): void {
  const verseElements = queryVerses(document);

  verseElements.forEach(
    (verseElement): void => {
      const aRubys = verseElement.querySelectorAll('a ruby');

      aRubys.forEach(
        (aRuby): void => {
          // console.log(aRuby.previousElementSibling.outerHTML);
          const parentElement = aRuby.parentElement;
          Array.from(aRuby.parentElement.childNodes).forEach(
            (child): void => {
              // aRuby.insertAdjacentElement(
              //   'afterbegin',
              //   aRuby.previousElementSibling,
              //   );
              if (child) {
                copyAttributes(aRuby.parentElement, child as Element);
                // document.insertBefore(aRuby.parentElement, child);

                console.log((child as Element).outerHTML);
                aRuby.parentElement.insertAdjacentElement(
                  'beforebegin',
                  child as Element,
                );
                // aRuby.parentElement.insertBefore(
                //   child as Element,
                //   aRuby.parentElement.previousElementSibling,
                // );
              }
            },
          );

          parentElement.remove();
        },
      );
    },
  );
}
