import { LwwElementSet } from "src/LwwElementSet";
import { ISet, IGraph, Tuple } from "src/interfaces";

export class LwwElementGraph<TValue> implements IGraph<TValue, ISet<TValue>> {
  vertices: LwwElementSet<TValue>;
  edges: LwwElementSet<string>;

  constructor() {
    this.edges = new LwwElementSet<string>();
    this.vertices = new LwwElementSet<TValue>();
  }

  addEdge(vertexA: TValue, vertexB: TValue): void {
    if (vertexA === vertexB) {
      console.log("vertexA must be different from vertexB");
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

  removeEdge(u: TValue, v: TValue): void {
    this.edges.remove(JSON.stringify([u, v]));
  }

  addVertex(u: TValue): void {
    this.vertices.add(u);
  }

  removeVertex(u: TValue): void {
    let vertexExistsInEdge = false;

    for (const stringifiedValue of this.edges.listAllElements()) {
      const [vertexA, vertexB] = JSON.parse(stringifiedValue) as Tuple<TValue>;

      if (vertexA === u || vertexB === u) {
        vertexExistsInEdge = true;
      }
    }

    if (vertexExistsInEdge) {
      console.log("Cannot remove vertex because it is contained in edge");
      return;
    }

    this.vertices.remove(u);
  }

  containsVertex(u: TValue): boolean {
    return this.vertices.contains(u);
  }

  queryConnectedVertices(u: TValue): TValue[] {
    const result: TValue[] = [];

    for (const stringifiedValue of this.edges.listAllElements()) {
      const [vertexA, vertexB] = JSON.parse(stringifiedValue) as Tuple<TValue>;

      if (u === vertexA) result.push(vertexB);

      if (u === vertexB) result.push(vertexA);
    }

    return result;
  }

  findPath(from: TValue, to: TValue): TValue[] {
    const visited = new Set<TValue>();

    const pathResults: TValue[][] = [];

    this.#pathHelper(from, to, visited, [], pathResults);

    const successfulPaths = pathResults.filter(
      (path) => path[path.length - 1] === to
    );

    let shortestPath = successfulPaths[0];

    for (let i = 0; i < successfulPaths.length; i++) {
      const currentPath = successfulPaths[i];

      if (currentPath.length < shortestPath.length) {
        shortestPath = currentPath;
      }
    }

    if (shortestPath === undefined) {
      console.log(`Unable to find path between ${from} and ${to}`);
    }

    return shortestPath;
  }

  #pathHelper(
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
      this.#pathHelper(node, targetNode, visited, [...path], pathResults);
    }
  }

  //TODO: test merging
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
