import { ISet } from "src/interfaces";
import { Tuple } from "src/types";

export class LwwElementSet<T> implements ISet<T> {
  #added: Map<T, Date>;
  #removed: Map<T, Date>;

  constructor(added: Tuple<T, Date>[] = [], removed: Tuple<T, Date>[] = []) {
    this.#added = new Map<T, Date>(added);
    this.#removed = new Map<T, Date>(removed);
  }

  get added() {
    const result: Tuple<T, Date>[] = [];

    for (const [key, value] of this.#added) {
      result.push([key, value]);
    }

    return result;
  }

  get removed() {
    const result: Tuple<T, Date>[] = [];

    for (const [key, value] of this.#removed) {
      result.push([key, value]);
    }

    return result;
  }

  merge(set: ISet<T>): void {
    this.#mergeValuesIntoMap(this.#added, set.added);
    this.#mergeValuesIntoMap(this.#removed, set.removed);
  }

  #mergeValuesIntoMap(map: Map<T, Date>, newValues: Tuple<T, Date>[]) {
    for (let [key, newValue] of newValues) {
      const existingValue = map.get(key);

      if (existingValue === undefined) {
        map.set(key, newValue);
        continue;
      }

      //TODO: test that merge keeps latest
      const latestValue = existingValue >= newValue ? existingValue : newValue;

      map.set(key, latestValue);
    }
  }

  add(element: T): void {
    this.#added.set(element, new Date());
  }

  remove(element: T): void {
    this.#removed.set(element, new Date());
  }

  contains(element: T): boolean {
    const addedElement = this.#added.get(element);

    if (addedElement === undefined) return false;

    const removedElement = this.#removed.get(element);

    if (removedElement === undefined) {
      return true;
    }

    return addedElement > removedElement;
  }

  listAllElements(): T[] {
    const result: T[] = [];

    for (let [key, _] of this.#added) {
      if (this.contains(key)) {
        result.push(key);
      }
    }

    return result;
  }
}
