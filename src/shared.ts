export function filteredUndefined<T>(arg: T[]): T[] {
  return arg.filter(
    (a): boolean => {
      return a !== undefined;
    },
  );
}
export function getRanges(array: number[]): [number, number][] {
  const ranges: [number, number][] = [];
  let rstart: number, rend: number;

  for (let i = 0; i < array.length; i++) {
    rstart = array[i];
    rend = rstart;
    while (array[i + 1] - array[i] === 1) {
      rend = array[i + 1]; // increment the index if the numbers sequential
      i++;
    }
    ranges.push(rstart === rend ? [rstart, rstart] : [rstart, rend]);
  }
  return ranges;
}

export function nodeListOfToArray<T extends Node>(
  nodeListOf: NodeListOf<T>,
): T[] {
  return Array.from(nodeListOf);
}
