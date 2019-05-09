export function queryVerses(document: Document): NodeListOf<Element> {
  return document.querySelectorAll(
    'header > *,.hidden-paragraph > .verse, .body-block > p, nav > ul > li > *, .body-block > div > *',
  );
}
