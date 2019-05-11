import { queryVerses, queryARubyParents } from './verses';

export function copyAttributes(from: Element, to: Element): void {
  Array.from(from.attributes).forEach(
    (attr): void => {
      if (attr && to.hasAttribute && !to.hasAttribute(attr.name)) {
        // console.log(attr);
        // console.log(to.parentElement.getAttribute('href'));

        // if (attr.name === 'href') {
        //   console.log(attr.value);
        // }

        if (attr.name === 'href' && !attr.value.startsWith('#')) {
          // const regex = new RegExp(
          //   `/(?<=(scriptures\/.+?\/)).+?\/[\S]+(?=\.html)/d`,
          // );
          // const newHref = regex.exec(attr.value);
          // console.log(attr.value);

          to.setAttribute(attr.name.replace('href', 'href'), attr.value);
        } else {
          {
            to.setAttribute(attr.name.replace('href', 'ref'), attr.value);
          }
        }
      }
    },
  );
}

function queryParents(element: Element, selector: string): Element[] {
  return Array.from(element.querySelectorAll(selector)).map(
    (child): Element => {
      return child.parentElement;
    },
  );
}

function convertTextNodeToNode(document: Document, element: Element): void {
  Array.from(element.childNodes)
    .filter(
      (e): boolean => {
        return e.nodeName === '#text';
      },
    )
    .map(
      (e): void => {
        const newElement = document.createElement('span');
        newElement.textContent = e.textContent;
        element.replaceChild(newElement, e);
      },
    );
}

export function removeRubyInAElements(document: Document): void {
  const verseElements = queryVerses(document);
  queryARubyParents(document).forEach(
    (parent): void => {
      Array.from(parent.childNodes)
        .filter(
          (child): boolean => {
            return (child as Element).outerHTML !== undefined;
          },
        )
        .forEach(
          (child): void => {
            copyAttributes(parent, child as Element);
            parent.insertAdjacentElement('beforebegin', child as Element);
          },
        );
      // console.log(parent.outerHTML);
      parent.remove();
    },
  );

  return;

  verseElements.forEach(
    (verseElement): void => {
      const t: string[] = ['a[href] ruby'];
      const parents = queryParents(verseElement, t.toString());
      parents.map(
        (parent): void => {
          convertTextNodeToNode(document, parent);
        },
      );

      console.log(
        parents.map(
          (p): string => {
            return p.getAttribute('href');
          },
        ),
      );

      // console.log(
      //   Array.from(aRubys).map(
      //     (a): string => {
      //       return a.outerHTML;
      //     },
      //   ),
      // );

      // const temp = Array.from(aRubys).map(
      //   (a): string => {
      //     return a.parentElement.nodeName;
      //   },
      // );

      // if (temp.length > 0) {
      //   console.log(temp);
      // }

      // Array.from(aRubys).forEach(
      //   (aRuby): void => {
      //     const parentElement = aRuby.parentElement;
      //     const childNodes = Array.from(aRuby.parentElement.childNodes);

      //     childNodes
      //       .filter(
      //         (child): boolean => {
      //           return child.nodeName === '#text';
      //         },
      //       )
      //       .map(
      //         (child): void => {
      //           const newNode = document.createElement('span');
      //           newNode.textContent = child.textContent;
      //           child.parentElement.replaceChild(newNode, child);
      //         },
      //       );
      //     Array.from(aRuby.parentElement.childNodes).forEach(
      //       (child): void => {
      //         if (child) {
      //           copyAttributes(aRuby.parentElement, child as Element);

      //           // console.log();

      //           try {
      //             if (child.nodeName === '#text') {
      //               aRuby.parentElement.insertAdjacentText(
      //                 'beforebegin',
      //                 child.textContent,
      //               );
      //             } else {
      //               aRuby.parentElement.insertAdjacentElement(
      //                 'beforebegin',
      //                 child as Element,
      //               );
      //             }
      //           } catch (error) {
      //             console.log(error);

      //             console.log(child.parentElement.outerHTML);
      //           }
      //         }
      //       },
      //     );

      //     parentElement.remove();
      //   },
      // );
    },
  );
}
