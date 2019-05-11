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
    'header > *,.hidden-paragraph > .verse, .body-block > p, nav > ul > li > *, .body-block > div > *',
  );
}
