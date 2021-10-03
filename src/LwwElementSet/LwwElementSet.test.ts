import { ISet, Tuple } from "src/interfaces";
import { LwwElementSet } from "src/LwwElementSet";

describe("Given an LwwElementSet", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  let set: ISet<number>;

  beforeEach(() => {
    set = new LwwElementSet();
  });

  describe("When an element has been added", () => {
    let addedValue = 1;
    let addedTimestamp = 1632943954782;

    beforeEach(() => {
      const now = new Date(addedTimestamp);
      jest.setSystemTime(now);

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

    let now: Date;
    beforeEach(() => {
      now = new Date();
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
    let primarySet: ISet<number>;
    // TODO: refactor to use default set rather than primarySet

    // maybe use a times array t[]

    beforeEach(() => {
      const now = new Date();
      jest.setSystemTime(now);

      const firstSet: Tuple<number, Date>[] = [
        [1, new Date(1632943954782)],
        [2, new Date(1632943954783)],
        [3, new Date(1632943954784)],
      ];

      const secondSet: Tuple<number, Date>[] = [
        [4, new Date(1632943954785)],
        [5, new Date(1632943954786)],
        [6, new Date(1632943954787)],
      ];

      primarySet = new LwwElementSet(firstSet, []);
      secondarySet = new LwwElementSet(secondSet, []);

      jest.setSystemTime(new Date(1632943954788));
      primarySet.remove(2);
      jest.setSystemTime(new Date(1632943954789));
      secondarySet.remove(5);
    });

    test("And there is a conflict Then the set is biased towards delete", () => {
      jest.setSystemTime(new Date(1632943954888));
      primarySet.add(9);
      secondarySet.remove(9);

      primarySet.merge(secondarySet);
      secondarySet.merge(primarySet);

      expect(primarySet.listAllElements()).not.toContain(9);
      expect(secondarySet.listAllElements()).not.toContain(9);
    });

    test("Then the set contains the correct elements", () => {
      primarySet.merge(secondarySet);

      expect(primarySet.listAllElements()).toIncludeAllMembers([1, 3, 4, 6]);
    });

    test("Then the set has merged all added values correctly", () => {
      primarySet.merge(secondarySet);

      expect(primarySet.added).toIncludeAllMembers([
        [1, new Date(1632943954782)],
        [3, new Date(1632943954784)],
        [4, new Date(1632943954785)],
        [6, new Date(1632943954787)],
      ]);
    });

    test("Then the set has merged all removed values correctly", () => {
      primarySet.merge(secondarySet);

      expect(primarySet.removed).toIncludeAllMembers([
        [2, new Date(1632943954788)],
        [5, new Date(1632943954789)],
      ]);
    });

    test("And the same entry is contained in both graphs with different times Then the latest should be persisted", () => {
      const latestTime = 1632943954784;
      jest.setSystemTime(new Date(latestTime));

      secondarySet.add(2);

      primarySet.merge(secondarySet);

      expect(primarySet.added).toIncludeAllMembers([[2, new Date(latestTime)]]);
    });
  });
});

const moveTimeForwards = (now: Date) =>
  jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));
