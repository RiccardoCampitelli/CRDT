import { ISet } from "src/interfaces";

export interface IGraph<TValue, TSet extends ISet<TValue>> {
  edges: ISet<string>;
  vertices: TSet;

  /**
   *
   * Will attempt to add an edge between the two vertices.
   *
   * If one of the vertices does not exist or the two vertices are the same
   * then the edge will not be added.
   */
  addEdge(vertexA: TValue, vertexB: TValue): void;

  /**
   * Adds an edge between the two vertices.
   */
  removeEdge(vertexA: TValue, vertexB: TValue): void;

  /**
   * Adds a new vertex to the graph.
   */
  addVertex(vertex: TValue): void;

  /**
   * Will attempt to remove vertex.
   *
   * If vertex is currently supporting an existing edge then the vertex will not be removed.
   */
  removeVertex(vertex: TValue): void;

  /**
   * Checks if given vertex is is contained in the vertices set.
   */
  containsVertex(vertex: TValue): boolean;

  /**
   * Will return an array of TValue which contains all vertices that are connected to u.
   */
  queryConnectedVertices(vertex: TValue): TValue[];

  /**
   * Will return an array of vertices which represents a path between the two nodes.
   */
  findPath(from: TValue, to: TValue): TValue[];

  /**
   * Merges state from graph into current.
   */
  merge(graph: IGraph<TValue, TSet>): void;
}
