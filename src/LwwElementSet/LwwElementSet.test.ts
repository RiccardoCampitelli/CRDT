import { ISet } from "src/interfaces";
import { Tuple } from "src/types";
import { LwwElementSet } from "src/LwwElementSet";

describe("Given an LwwElementSet", () => {
  let set: ISet<number>;
  let now: Date;

  beforeEach(() => {
    jest.useFakeTimers();
    now = new Date();
    set = new LwwElementSet();
  });

  describe("When an element has been added", () => {
    let addedValue = 1;
    let addedTimestamp = 1632943954782;

    beforeEach(() => {
      jest.setSystemTime(new Date(addedTimestamp));

      set.add(addedValue);
    });

    test("Then checking if added element is contained should be true", () => {
      const result = set.contains(addedValue);

      expect(result).toBe(true);
    });

    test("Then added value should be returned in the list of existing values", () => {
      const result = set.listAllElements();

      expect(result).toContain(addedValue);
    });

    test("Then added value should be in added collection with correct timestamp", () => {
      expect(set.added).toIncludeSameMembers([
        [addedValue, new Date(addedTimestamp)],
      ]);
    });
  });

  describe("When an element has been removed", () => {
    const removedElement = 1;

    beforeEach(() => {
      jest.setSystemTime(now);

      set.add(removedElement);

      moveTimeForwards(now);

      set.remove(removedElement);
    });

    test("Then it should not contain the added element", () => {
      const result = set.contains(removedElement);

      expect(result).toBe(false);
    });

    test("Then added value should be in removed collection with correct timestamp", () => {
      expect(set.removed).toIncludeSameMembers([[removedElement, now]]);
    });
  });

  describe("When merging in with another set", () => {
    let secondarySet: ISet<number>;

    const times: Date[] = [
      new Date(1632943954782),
      new Date(1632943954783),
      new Date(1632943954784),
      new Date(1632943954785),
      new Date(1632943954786),
      new Date(1632943954787),
      new Date(1632943954788),
      new Date(1632943954789),
    ];

    beforeEach(() => {
      jest.setSystemTime(now);

      const firstSetAddedValues: Tuple<number, Date>[] = [
        [1, times[0]],
        [2, times[1]],
        [3, times[2]],
      ];

      const firstSetDeletedValues: Tuple<number, Date>[] = [[2, times[6]]];

      const secondSetAddedValues: Tuple<number, Date>[] = [
        [4, times[3]],
        [5, times[4]],
        [6, times[5]],
      ];

      const secondSetDeletedValues: Tuple<number, Date>[] = [[5, times[7]]];

      set = new LwwElementSet(firstSetAddedValues, firstSetDeletedValues);
      secondarySet = new LwwElementSet(
        secondSetAddedValues,
        secondSetDeletedValues
      );
    });

    test("And there is a conflict Then the set is biased towards delete", () => {
      jest.setSystemTime(new Date(1632943954888));
      set.add(9);
      secondarySet.remove(9);

      set.merge(secondarySet);
      secondarySet.merge(set);

      expect(set.listAllElements()).not.toContain(9);
      expect(secondarySet.listAllElements()).not.toContain(9);
    });

    test("Then the set contains the correct elements", () => {
      set.merge(secondarySet);

      expect(set.listAllElements()).toIncludeAllMembers([1, 3, 4, 6]);
    });

    test("Then the set has merged all added values correctly", () => {
      set.merge(secondarySet);

      expect(set.added).toIncludeSameMembers([
        [1, times[0]],
        [2, times[1]],
        [3, times[2]],
        [4, times[3]],
        [5, times[4]],
        [6, times[5]],
      ]);
    });

    test("Then the set has merged all removed values correctly", () => {
      set.merge(secondarySet);

      expect(set.removed).toIncludeSameMembers([
        [2, times[6]],
        [5, times[7]],
      ]);
    });

    test("And the same entry is contained in both graphs with different times Then the latest should be persisted", () => {
      const latestTime = 1632943954784;
      jest.setSystemTime(new Date(latestTime));

      secondarySet.add(2);

      set.merge(secondarySet);

      expect(set.added).toIncludeAllMembers([[2, new Date(latestTime)]]);
    });
  });
});

const moveTimeForwards = (now: Date) =>
  jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));
