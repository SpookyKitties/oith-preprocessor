// import { readFile } from 'fs-extra';
import { getFiles } from './files';
import { loadFile } from './dom';
// import { queryWTags } from './wtags';
// import { parseWTagGroups } from './wTagGroups';
import { basename, normalize } from 'path';
import { writeFile } from 'fs-extra';
import { removeRubyInAElements } from './flattenWTags';
import { parseWTagGroups } from './wTagGroups';

async function processFiles(fileNames: string[]): Promise<void> {
  fileNames.slice(0, 10000).forEach(
    async (fileName): Promise<void> => {
      const jsdom = await loadFile(fileName);
      const document = jsdom.window.document;
      // console.log(document.documentElement.innerHTML);
      console.log();
      // if (document.querySelectorAll('a[href*=".."] ruby').length > 0) {
      //   console.log(fileName);
      // }
      removeRubyInAElements(document);
      console.log(document.querySelectorAll('ruby[href]').length);
      parseWTagGroups(document);
      try {
        await writeFile(
          normalize(`./data/${basename(fileName)}`),
          document.documentElement.outerHTML,
        );
      } catch {}

      // queryWTags(document);
    },
  );
}

async function main(): Promise<void> {
  await processFiles(await getFiles());
  console.log('asdf');
}

main();
