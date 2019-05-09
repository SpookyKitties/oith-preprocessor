import { JSDOM } from 'jsdom';
import { readFile } from 'fs-extra';
export async function loadFile(fileName: string): Promise<JSDOM> {
  try {
    const file = await readFile(fileName);
    return new JSDOM(file.toString());
  } catch (error) {
    console.log(error);
    throw `Couldn't load dom`;
  }
}
