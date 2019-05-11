// import { readFile } from 'fs-extra';
import { getFiles } from './files';
import { loadFile } from './dom';
// import { queryWTags } from './wtags';
import { parseWTagGroups } from './wTagGroups';

async function processFiles(fileNames: string[]): Promise<void> {
  fileNames.slice(0, 100000).forEach(
    async (fileName): Promise<void> => {
      const jsdom = await loadFile(fileName);
      const document = jsdom.window.document;

      // queryWTags(document);
      parseWTagGroups(document);
    },
  );
}

async function main(): Promise<void> {
  await processFiles(await getFiles());
  console.log('asdf');
}

main();
