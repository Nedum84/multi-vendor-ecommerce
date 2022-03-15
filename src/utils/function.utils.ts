import { generateChars } from "./random.string";

export async function mapAsync<T, U>(
  arr: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
  thisArg?: any
) {
  return await Promise.all(
    arr.map(async (value, index, array) => {
      try {
        return await callbackfn(value, index, array);
      } catch (e) {
        throw e;
      }
    }, thisArg)
  );
}

export async function asyncForEach<T>(array: Array<T>, callback: (item: T, index: number) => Promise<void>) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index);
  }
}

/**
 * Checks if two arrays are equal
 * @param a array 1
 * @param b array 2
 * @returns boolean
 */
export function arraysEqual<T>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const aClone = [...a].sort();
  const bClone = [...b].sort();
  for (var i = 0; i < aClone.length; ++i) {
    if (aClone[i] !== bClone[i]) return false;
  }
  return true;
}

/** Break array into chunks of smaller array
 * eg. array of 100 broken into array of 20 each into 5 arrays
 * @param arr Array: Array to break into chunks
 * @param size number: chunk size
 * @returns Object Array
 * */
export function chunkArrayInGroups<T>(arr: Array<T>, size: number) {
  var myArray: T[] = [];
  for (var i = 0; i < arr.length; i += size) {
    //@ts-ignore
    myArray.push(arr.slice(i, i + size));
  }
  return myArray;
}

/**
 * Makes object array unique by object key
 * @param objArray Object Array
 * @param key object key to make unique
 * @returns Object Array
 */
export function objArrayUniqBy<T extends { [k: string]: any }>(objArray: T[], key: keyof T): T[] {
  var seen: T[] = [];
  return objArray.filter(function (item) {
    if (item.hasOwnProperty(key) || key in item || item[key]) {
      const isSeen = seen.find((x) => x[key] === item[key]);
      if (!isSeen) {
        seen.push(item);
        return true;
      }
    }
    return false;
  }) as T[];
}

/**
 * Shuffles string, number, object, or ANY array
 * @param arr Array
 * @param reference_same_arr boolean (default:true) returns a reference to the same array or not
 * @returns Shuffled Array
 */
export function shuffleArray<T>(arr: T[], reference_same_arr = true): T[] {
  if (reference_same_arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  //--> Create a new array, copy to it to avoid tapering with the original reference
  const newArray: T[] = [];

  arr.forEach(function (val) {
    newArray.push(val);
  });
  return newArray.sort(() => Math.random() - 0.5);
}

/**
 * Generates slug from text
 * @param text string
 * @returns string
 */
export function generateSlug(text: string): string {
  if (!text) return generateChars(15, "alphanumeric", "lowercase");

  return text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
}
/**
 * Makes array distinct
 * @param arr T[]
 * @returns T[]
 */
export function distinctArray<T>(arr: T[]): T[] {
  const uniqueArr = arr.filter((x, i, a) => a.indexOf(x) == i);
  // const uniqueArr = Array.from(new Set(arr))
  return uniqueArr;
}

/**
 * Checks if two objects are equal
 * @param obj1 Object 1
 * @param obj2 Object 2
 * @returns boolean
 */
export function isObjectsEqual(obj1: { [k: string]: any }, obj2: { [k: string]: any }): boolean {
  // return JSON.stringify(obj1) === JSON.stringify(obj2);

  for (var p in obj1) {
    if (obj1.hasOwnProperty(p)) {
      if (String(obj1[p]) != String(obj2[p])) {
        return false;
      }
    }
  }
  for (var p in obj2) {
    if (obj2.hasOwnProperty(p)) {
      if (String(obj1[p]) != String(obj2[p])) {
        return false;
      }
    }
  }
  return true;
}
