import { LwwElementSet } from "src/LwwElementSet";
import { IGraph } from "src/interfaces";
import { LwwElementGraph } from "./LwwElementGraph";
import { moveTimeForwards } from "src/utility";

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

    test("And the two vertices exist Then it should be contained in the edges set", () => {
      graph.addEdge(firstVertex, secondVertex);

      expect(
        graph.edges.contains(JSON.stringify([firstVertex, secondVertex]))
      ).toBeTrue();
    });

    test("And one of the two vertices does not exist Then it should not be contained in the edges set", () => {
      const nonExistingVertex = 3;
      graph.addEdge(firstVertex, nonExistingVertex);

      expect(
        graph.edges.contains(JSON.stringify([firstVertex, nonExistingVertex]))
      ).toBeFalse();
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

      moveTimeForwards(now);
    });

    test("Then it should no longer be contained in the graph", () => {
      graph.removeEdge(firstVertex, secondVertex);

      expect(
        graph.edges.contains(JSON.stringify([firstVertex, secondVertex]))
      ).toBeFalse();
    });
  });

  describe("When adding a vertex to the graph", () => {
    const addedVertex = 1;

    beforeEach(() => {
      graph.addVertex(addedVertex);
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

      moveTimeForwards(now);
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
    const externalVertex = 5;

    beforeEach(() => {
      graph.addVertex(centralVertex);
      graph.addVertex(firstVertex);
      graph.addVertex(secondVertex);
      graph.addVertex(externalVertex);

      graph.addEdge(centralVertex, firstVertex);
      graph.addEdge(centralVertex, secondVertex);
      graph.addEdge(secondVertex, externalVertex);
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

    test("Then findPath should return a valid path", () => {
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
    const otherMiddleNode = 4;

    beforeEach(() => {
      graph.addVertex(startNode);
      graph.addVertex(endNode);
      graph.addVertex(middleNode);
      graph.addVertex(otherMiddleNode);

      graph.addEdge(startNode, middleNode);

      graph.addEdge(otherMiddleNode, endNode);
    });

    test("Then findPath should return undefined", () => {
      expect(graph.findPath(startNode, endNode)).toBe(undefined);
    });
  });

  describe("When multiple paths exist between two nodes", () => {
    const startNode = 1;
    const endNode = 2;

    const firstPath = [3, 4];
    const secondPath = [5, 6, 7];

    beforeEach(() => {
      graph.addVertex(startNode);
      graph.addVertex(endNode);

      graph.addVertex(secondPath[0]);
      graph.addVertex(secondPath[1]);
      graph.addVertex(secondPath[2]);

      graph.addEdge(startNode, secondPath[0]);
      graph.addEdge(secondPath[0], secondPath[1]);
      graph.addEdge(secondPath[1], secondPath[2]);
      graph.addEdge(secondPath[2], endNode);

      graph.addVertex(firstPath[0]);
      graph.addVertex(firstPath[1]);

      graph.addEdge(startNode, firstPath[0]);
      graph.addEdge(firstPath[0], firstPath[1]);
      graph.addEdge(firstPath[1], endNode);
    });

    test("Then the shortest of the paths is returned", () => {
      expect(graph.findPath(startNode, endNode)).toIncludeSameMembers([
        startNode,
        firstPath[0],
        firstPath[1],
        endNode,
      ]);
    });
  });

  describe("When merging with another graph", () => {
    const secondaryGraph = new LwwElementGraph<number>();

    const primaryGraphVertices = [1, 2];
    const secondaryGraphVertices = [2, 3];

    beforeEach(() => {
      jest.setSystemTime(now);
      graph.addVertex(primaryGraphVertices[0]);
      graph.addVertex(primaryGraphVertices[1]);

      secondaryGraph.addVertex(secondaryGraphVertices[0]);
      secondaryGraph.addVertex(secondaryGraphVertices[1]);

      graph.addEdge(primaryGraphVertices[0], primaryGraphVertices[1]);
      secondaryGraph.addEdge(
        secondaryGraphVertices[0],
        secondaryGraphVertices[1]
      );

      moveTimeForwards(now);
    });

    test("Then it should contain vertices from secondaryGraph", () => {
      graph.merge(secondaryGraph);

      expect(graph.vertices.listAllElements()).toIncludeSameMembers([
        primaryGraphVertices[0],
        primaryGraphVertices[1],
        secondaryGraphVertices[1],
      ]);
    });

    test("Then it should contain edges from secondaryGraph", () => {
      graph.merge(secondaryGraph);

      expect(graph.edges.listAllElements()).toIncludeSameMembers([
        JSON.stringify([primaryGraphVertices[0], primaryGraphVertices[1]]),
        JSON.stringify([secondaryGraphVertices[0], secondaryGraphVertices[1]]),
      ]);
    });

    test("And there is a concurrent addEdge and removeVertex Then vertex is removed and edge is not added", () => {
      secondaryGraph.addVertex(5);
      graph.addVertex(4);
      graph.addVertex(5);

      moveTimeForwards(now);

      graph.addEdge(4, 5);
      secondaryGraph.removeVertex(5);

      graph.merge(secondaryGraph);

      expect(graph.vertices.listAllElements()).not.toContain(5);
      expect(graph.edges.listAllElements()).not.toContain(
        JSON.stringify([4, 5])
      );
    });
  });
});
