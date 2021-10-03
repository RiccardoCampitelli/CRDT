import { Tuple } from "src/types";

export interface ISet<T> {
  added: Tuple<T, Date>[];
  removed: Tuple<T, Date>[];

  /**
   * Adds new element to set.
   */
  add(element: T): void;

  /**
   * Removes element from set.
   */
  remove(element: T): void;

  /**
   * Checks if given element is present in set.
   * 
   * An element is considered present if it is contained in the added
   * elements and not in the removed elements with a later timestamp.
   */
  contains(element: T): boolean;

  /**
   * Returns an array containing all elements that are considered to be present in the set.
   */
  listAllElements(): T[];

  /**
   * Merges set state into current.
   * 
   * The current implementation is biased towards deletion
   * 
   * This means that in case of a concurrent add and delete of the same element 
   * then the delete action will take precedence.
   */
  merge(set: ISet<T>): void;
}
