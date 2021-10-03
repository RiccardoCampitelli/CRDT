import { LwwElementSet } from "src/LwwElementSet";
import { IGraph } from "src/interfaces";
import { LwwElementGraph } from "./LwwElementGraph";

describe("Given an LwwElementGraph", () => {
  let graph: IGraph<number, LwwElementSet<number>>;
  let now: Date;

  beforeEach(() => {
    jest.useFakeTimers();
    now = new Date();

    graph = new LwwElementGraph<number>();
  });

  describe("When adding an edge between two vertices", () => {
    const firstVertex = 1;
    const secondVertex = 2;

    beforeEach(() => {
      graph.addVertex(firstVertex);
      graph.addVertex(secondVertex);
    });

    test("And the two vertices are the same Then the edge should not be added", () => {
      graph.addEdge(firstVertex, firstVertex);

      expect(
        graph.edges.contains(JSON.stringify([firstVertex, firstVertex]))
      ).toBeFalse();
    });

    test("And the two vertices exist Then it should be contained in the edges", () => {
      graph.addEdge(firstVertex, secondVertex);

      expect(graph.edges.listAllElements()).toIncludeAllMembers([
        JSON.stringify([firstVertex, secondVertex]),
      ]);
    });

    test("And one of the two vertices does not exist Then it should be contained in the edges", () => {
      const nonExistingVertex = 3;
      graph.addEdge(firstVertex, nonExistingVertex);

      expect(graph.edges.listAllElements()).toBeEmpty();
    });

    test("And the edge already exists Then it is not added again", () => {
      graph.addEdge(firstVertex, secondVertex);
      graph.addEdge(firstVertex, secondVertex);

      expect(graph.edges.listAllElements()).toIncludeSameMembers([
        JSON.stringify([firstVertex, secondVertex]),
      ]);
    });
  });

  describe("When removing an edge between two vertices", () => {
    const firstVertex = 1;
    const secondVertex = 2;

    beforeEach(() => {
      jest.setSystemTime(now);

      graph.addVertex(firstVertex);
      graph.addVertex(secondVertex);
      graph.addEdge(firstVertex, secondVertex);
      graph.addEdge(firstVertex, secondVertex);

      jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));
    });

    test("Then it should no longer be contained in the graph", () => {
      graph.removeEdge(firstVertex, secondVertex);

      expect(graph.edges.listAllElements()).not.toIncludeAllMembers([
        JSON.stringify([firstVertex, secondVertex]),
      ]);
    });
  });

  describe("When adding a vertex to the graph", () => {
    const addedVertex = 1;

    beforeEach(() => {
      graph.addVertex(addedVertex);
    });

    test("Then it should be contained in the added set", () => {
      expect(graph.vertices.listAllElements()).toContain(addedVertex);
    });

    test("Then containsVertex for the added vertex returns true", () => {
      expect(graph.containsVertex(addedVertex)).toBeTrue();
    });
  });

  describe("When removing a vertex from the graph", () => {
    const vertexToRemove = 1;
    const secondVertex = 2;

    beforeEach(() => {
      jest.setSystemTime(now);
      graph.addVertex(vertexToRemove);
      graph.addVertex(secondVertex);

      jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));
    });

    test("Then containsVertex for the added vertex returns false", () => {
      graph.removeVertex(vertexToRemove);

      expect(graph.containsVertex(vertexToRemove)).toBeFalse();
    });

    test("And an edge containing the vertex exists Then vertex is not removed", () => {
      graph.addEdge(vertexToRemove, secondVertex);

      graph.removeVertex(vertexToRemove);

      expect(graph.containsVertex(vertexToRemove)).toBeTrue();
      expect(graph.edges.listAllElements()).toContain(
        JSON.stringify([vertexToRemove, secondVertex])
      );
    });
  });

  describe("When querying connected vertices", () => {
    const centralVertex = 1;
    const firstVertex = 2;
    const secondVertex = 3;

    beforeEach(() => {
      graph.addVertex(centralVertex);
      graph.addVertex(firstVertex);
      graph.addVertex(secondVertex);

      graph.addEdge(centralVertex, firstVertex);
      graph.addEdge(centralVertex, secondVertex);
    });

    test("Then querying connected vertices should return all connected vertices", () => {
      expect(graph.queryConnectedVertices(centralVertex)).toIncludeAllMembers([
        firstVertex,
        secondVertex,
      ]);
    });
  });

  describe("When a path exists between two nodes", () => {
    const startNode = 1;
    const centralVertex = 2;
    const extraNode = 5;
    const endNode = 3;

    beforeEach(() => {
      graph.addVertex(centralVertex);
      graph.addVertex(startNode);
      graph.addVertex(endNode);
      graph.addVertex(extraNode);

      graph.addEdge(centralVertex, extraNode);
      graph.addEdge(centralVertex, startNode);
      graph.addEdge(centralVertex, endNode);
    });

    test("Then findPath should return expected result", () => {
      expect(graph.findPath(startNode, endNode)).toIncludeSameMembers([
        startNode,
        centralVertex,
        endNode,
      ]);
    });
  });

  describe("When a path does not exist between two nodes", () => {
    const startNode = 1;
    const endNode = 2;

    const middleNode = 3;
    const middleNode2 = 4;

    beforeEach(() => {
      graph.addVertex(startNode);
      graph.addVertex(endNode);
      graph.addVertex(middleNode);
      graph.addVertex(middleNode2);

      graph.addEdge(startNode, middleNode);

      graph.addEdge(middleNode2, endNode);
    });

    test("Then findPath should return undefined", () => {
      expect(graph.findPath(startNode, endNode)).toBe(undefined);
    });
  });

  describe("When two paths exist between two nodes", () => {
    const startNode = 1;
    const endNode = 2;

    const path1 = 3;
    const path11 = 4;
    const path2 = 5;
    const path22 = 6;
    const path222 = 7;

    beforeEach(() => {
      graph.addVertex(startNode);
      graph.addVertex(endNode);

      graph.addVertex(path2);
      graph.addVertex(path22);
      graph.addVertex(path222);

      graph.addEdge(startNode, path2);
      graph.addEdge(path2, path22);
      graph.addEdge(path22, path222);
      graph.addEdge(path222, endNode);

      graph.addVertex(path1);
      graph.addVertex(path11);

      graph.addEdge(startNode, path1);
      graph.addEdge(path1, path11);
      graph.addEdge(path11, endNode);
    });

    test("Then one of the paths is returned", () => {
      expect(graph.findPath(startNode, endNode)).toIncludeSameMembers([
        startNode,
        path1,
        path11,
        endNode,
      ]);
    });
  });

  describe("When merging with another graph", () => {
    const mergeGraph = new LwwElementGraph<number>();

    beforeEach(() => {
      jest.setSystemTime(now);
      graph.addVertex(1);
      mergeGraph.addVertex(2);

      graph.addVertex(2);
      mergeGraph.addVertex(3);

      graph.addEdge(1, 2);
      mergeGraph.addEdge(2, 3);

      jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));
    });

    test("Then it should contain vertices from mergeGraph", () => {
      graph.merge(mergeGraph);

      expect(graph.vertices.listAllElements()).toIncludeSameMembers([1, 2, 3]);
    });

    test("Then it should contain edges from mergeGraph", () => {
      graph.merge(mergeGraph);

      expect(graph.edges.listAllElements()).toIncludeSameMembers([
        JSON.stringify([1, 2]),
        JSON.stringify([2, 3]),
      ]);
    });

    test("And there is a concurrent addEdge and removeVertex Then vertex is removed and edge is not added", () => {
      mergeGraph.addVertex(5);
      graph.addVertex(4);
      graph.addVertex(5);

      jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));

      graph.addEdge(4, 5);
      mergeGraph.removeVertex(5);

      graph.merge(mergeGraph);

      expect(graph.vertices.listAllElements()).not.toContain(5);
      expect(graph.edges.listAllElements()).not.toContain(
        JSON.stringify([4, 5])
      );
      expect(graph.queryConnectedVertices(5)).toBeEmpty();
    });
  });
});
