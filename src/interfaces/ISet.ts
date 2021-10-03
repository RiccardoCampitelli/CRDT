import { Tuple } from "src/types";

export interface ISet<T> {
  added: Tuple<T, Date>[];
  removed: Tuple<T, Date>[];

  add(element: T): void;

  remove(element: T): void;

  contains(element: T): boolean;

  listAllElements(): T[];

  merge(set: ISet<T>): void;
}
