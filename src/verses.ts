function convertHrefs(document: Document): void {
  document.querySelectorAll(`a[href*='..']`).forEach(
    (a): void => {
      const regex = new RegExp(
        /((?<=(([\.\.\/]{2,3}))(scriptures\/)(.+?\/)).+\/.+)/s,
      );

      ///Matches everything else
      const regex2 = new RegExp(/((?<=(([\.\.\/]{2}))(scriptures\/)).+\/.+)/s);
      const href = a
        .getAttribute('href')
        .replace('.html', '')
        .replace('?verse=', '.')
        .replace('#p', '.')
        .replace('#', '.');
      const regex1Test = regex.test(href);
      let exec: RegExpExecArray;
      if (regex1Test) {
        exec = regex.exec(href);
      } else {
        exec = regex2.exec(href);
      }
      if (exec) {
        try {
          a.setAttribute('href', exec[0]);
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log(a.outerHTML);
      }
    },
  );
}

export function queryVerses(document: Document): NodeListOf<Element> {
  convertHrefs(document);
  return document.querySelectorAll(
    'header > *,.hidden-paragraph > .verse, .body-block > p, nav > ul > li > *, .body-block > div > *,.body-block .verse',
  );
}
export function convertTextNodeToNode(
  document: Document,
  element: Element,
): void {
  console.log(element.outerHTML);

  Array.from(element.childNodes)
    .filter(
      (e): boolean => {
        return e.nodeName === '#text';
      },
    )
    .map(
      (e): void => {
        const newElement = document.createElement('span');
        if (e.textContent.includes('一―二十​')) {
          console.log(e.textContent);
        }
        newElement.textContent = e.textContent;
        element.replaceChild(newElement, e);
      },
    );
}

export function queryARubyParents(document: Document): Element[] {
  const verseElements = queryVerses(document);
  const t: string[] = ['a[href] ruby'];
  const parents: Element[] = [];

  verseElements.forEach(
    (verseElement): void => {
      verseElement.querySelectorAll(t.toString()).forEach(
        (ar): void => {
          parents.push(ar.parentElement);
        },
      );
    },
  );

  parents.map(
    (parent): void => {
      convertTextNodeToNode(document, parent);
    },
  );
  return parents;
}
