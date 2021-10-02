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
    const vertexAExists = this.vertices.contains(vertexA);
    const vertexBExists = this.vertices.contains(vertexB);

    const test = JSON.stringify([vertexA, vertexB]);

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
    for (const stringifiedValue of this.edges.listAllElements()) {
      const [vertexA, vertexB] = JSON.parse(stringifiedValue);

      if (vertexA === u || vertexB === u) {
        this.removeEdge(vertexA, vertexB);
      }
    }

    this.vertices.remove(u);
  }

  containsVertex(u: TValue): boolean {
    return this.vertices.contains(u);
  }

  queryConnectedVertices(u: TValue): TValue[] {
    const result: TValue[] = [];

    for (const stringifiedValue of this.edges.listAllElements()) {
      const [vertexA, vertexB] = JSON.parse(stringifiedValue);

      if (u === vertexA) result.push(vertexB);

      if (u === vertexB) result.push(vertexA);
    }

    return result;
  }

  findPath(from: TValue, to: TValue): TValue[] {
    const visited = new Set<TValue>();

    const path: TValue[] = [];

    this.#pathHelper(from, to, visited, path);

    if (path[path.length - 1] !== to) throw new Error("Unable to find path");

    return path;
  }

  #pathHelper(
    currentNode: TValue,
    targetNode: TValue,
    visited: Set<TValue>,
    path: TValue[]
  ) {
    if (visited.has(currentNode) === false) {
      visited.add(currentNode);
      path.push(currentNode);
    }

    if (visited.has(currentNode)) {
      return;
    }

    if (currentNode === targetNode) {
      return;
    }

    const allConnectedNodes = this.queryConnectedVertices(currentNode);

    for (const node of allConnectedNodes) {
      this.#pathHelper(node, targetNode, visited, path);
    }
  }

  merge(graph: IGraph<TValue, ISet<TValue>>): void {
    this.edges.merge(graph.edges);

    this.vertices.merge(graph.vertices);
  }
}
