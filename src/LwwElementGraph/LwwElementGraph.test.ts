import { LwwElementSet } from "src/LwwElementSet";
import { IGraph } from "src/interfaces";
import { LwwElementGraph } from "./LwwElementGraph";

describe("Given an LwwElementGraph", () => {
  let graph: IGraph<number, LwwElementSet<number>>;

  beforeEach(() => {
    jest.useFakeTimers();
    graph = new LwwElementGraph();
  });

  describe("When adding an edge between two vertices", () => {
    const firstVertex = 1;
    const secondVertex = 2;

    beforeEach(() => {
      graph.addVertex(firstVertex);
      graph.addVertex(secondVertex);
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
  });

  describe("When removing an edge between two vertices", () => {
    const firstVertex = 1;
    const secondVertex = 2;
    let now = new Date();

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
    const thirdVertex = 3;
    let now = new Date();

    beforeEach(() => {
      jest.setSystemTime(now);
      graph.addVertex(vertexToRemove);
      graph.addVertex(secondVertex);

      graph.addEdge(vertexToRemove, secondVertex);
      graph.addEdge(vertexToRemove, thirdVertex);
      jest.setSystemTime(now.setMinutes(now.getMinutes() + 1));
    });

    test("Then containsVertex for the added vertex returns false", () => {
      graph.removeVertex(vertexToRemove);

      expect(graph.containsVertex(vertexToRemove)).toBeFalse();
    });

    test("Then edges containing the removed vertex are also removed", () => {
      graph.removeVertex(vertexToRemove);

      expect(graph.edges.listAllElements()).not.toContain(
        JSON.stringify([vertexToRemove, secondVertex])
      );
      expect(graph.edges.listAllElements()).not.toContain(
        JSON.stringify([vertexToRemove, thirdVertex])
      );
    });
  });

  describe("When querying connected vertices", () => {
      
  })
});
