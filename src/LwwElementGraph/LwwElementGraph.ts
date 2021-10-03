import { LwwElementSet } from "src/LwwElementSet";
import { ISet, IGraph } from "src/interfaces";
import { Tuple } from "src/types";

export class LwwElementGraph<TValue> implements IGraph<TValue, ISet<TValue>> {
  vertices: LwwElementSet<TValue>;
  edges: LwwElementSet<string>;

  constructor() {
    this.edges = new LwwElementSet<string>();
    this.vertices = new LwwElementSet<TValue>();
  }

  addEdge(vertexA: TValue, vertexB: TValue): void {
    if (vertexA === vertexB) {
      console.warn("vertexA must be different from vertexB");
      return;
    }

    const vertexAExists = this.vertices.contains(vertexA);
    const vertexBExists = this.vertices.contains(vertexB);

    const edgeExists =
      this.edges.contains(JSON.stringify([vertexA, vertexB])) ||
      this.edges.contains(JSON.stringify([vertexB, vertexA]));

    if (edgeExists) {
      return;
    }

    if (vertexAExists && vertexBExists) {
      this.edges.add(JSON.stringify([vertexA, vertexB]));
    }
  }

  removeEdge(vertexA: TValue, vertexB: TValue): void {
    this.edges.remove(JSON.stringify([vertexA, vertexB]));
  }

  addVertex(vertex: TValue): void {
    this.vertices.add(vertex);
  }

  removeVertex(vertex: TValue): void {
    let vertexExistsInEdge = false;

    for (const stringifiedValue of this.edges.listAllElements()) {
      const [vertexA, vertexB] = JSON.parse(stringifiedValue) as Tuple<TValue>;

      if (vertexA === vertex || vertexB === vertex) {
        vertexExistsInEdge = true;
      }
    }

    if (vertexExistsInEdge) {
      console.warn("Cannot remove vertex because it is contained in edge");
      return;
    }

    this.vertices.remove(vertex);
  }

  containsVertex(vertex: TValue): boolean {
    return this.vertices.contains(vertex);
  }

  queryConnectedVertices(vertex: TValue): TValue[] {
    const result: TValue[] = [];

    for (const stringifiedValue of this.edges.listAllElements()) {
      const [vertexA, vertexB] = JSON.parse(stringifiedValue) as Tuple<TValue>;

      if (vertex === vertexA) result.push(vertexB);

      if (vertex === vertexB) result.push(vertexA);
    }

    return result;
  }

  findPath(from: TValue, to: TValue): TValue[] {
    const visited = new Set<TValue>();

    const pathResults: TValue[][] = [];

    this.#pathFinderHelper(from, to, visited, [], pathResults);

    let shortestPath = pathResults[0];

    for (let i = 0; i < pathResults.length; i++) {
      const currentPath = pathResults[i];

      if (currentPath.length < shortestPath.length) {
        shortestPath = currentPath;
      }
    }

    if (shortestPath === undefined) {
      console.warn(`Unable to find path between ${from} and ${to}`);
    }

    return shortestPath;
  }

  #pathFinderHelper(
    currentNode: TValue,
    targetNode: TValue,
    visited: Set<TValue>,
    path: TValue[],
    pathResults: TValue[][]
  ) {
    if (visited.has(currentNode)) {
      return;
    }

    if (currentNode === targetNode) {
      path.push(currentNode);
      pathResults.push([...path]);
      return;
    }

    if (visited.has(currentNode) === false) {
      visited.add(currentNode);
      path.push(currentNode);
    }

    const allConnectedNodes = this.queryConnectedVertices(currentNode);

    for (const node of allConnectedNodes) {
      this.#pathFinderHelper(node, targetNode, visited, [...path], pathResults);
    }
  }

  merge(graph: IGraph<TValue, ISet<TValue>>): void {
    this.vertices.merge(graph.vertices);

    this.edges.merge(graph.edges);

    const allEdges = this.edges.listAllElements();

    for (const stringifiedValue of allEdges) {
      const [vertexA, vertexB] = JSON.parse(stringifiedValue) as Tuple<TValue>;

      const containsVertexA = this.containsVertex(vertexA);
      const containsVertexB = this.containsVertex(vertexB);

      if (containsVertexA === false || containsVertexB === false) {
        this.removeEdge(vertexA, vertexB);
      }
    }
  }
}
