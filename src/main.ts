// import { readFile } from 'fs-extra';
import { getFiles } from './files';
import { loadFile } from './dom';
// import { queryWTags } from './wtags';
// import { parseWTagGroups } from './wTagGroups';
import { basename, normalize } from 'path';
import { writeFile } from 'fs-extra';
import { removeRubyInAElements } from './flattenWTags';

async function processFiles(fileNames: string[]): Promise<void> {
  fileNames.slice(0, 1).forEach(
    async (fileName): Promise<void> => {
      const jsdom = await loadFile(fileName);
      const document = jsdom.window.document;
      // console.log(document.documentElement.innerHTML);
      console.log();
      removeRubyInAElements(document);
      await writeFile(
        normalize(`./data/${basename(fileName)}`),
        document.documentElement.outerHTML,
      );

      // queryWTags(document);
      // parseWTagGroups(document);
    },
  );
}

async function main(): Promise<void> {
  await processFiles(await getFiles());
  console.log('asdf');
}

main();
