import { normalize } from 'path';
import expandTidle from 'expand-tilde';

import FastGlob from 'fast-glob';

export async function getFiles(): Promise<string[]> {
  return (await FastGlob(
    `${normalize(
      expandTidle('~/source/repos/scripture_files/scriptures_unprocessed'),
    )}/**/*`,
    { onlyFiles: true },
  )) as string[];
}
