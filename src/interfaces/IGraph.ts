import { ISet, Tuple } from "src/interfaces";

export interface IGraph<TValue, TSet extends ISet<TValue>> {
  edges: ISet<string>;
  vertices: TSet;

  addEdge(u: TValue, v: TValue): void;
  removeEdge(u: TValue, v: TValue): void;

  addVertex(u: TValue): void;
  removeVertex(u: TValue): void;

  containsVertex(u: TValue): boolean;

  queryConnectedVertices(u: TValue): TValue[];

  findPath(u: TValue, v: TValue): TValue[];

  merge(graph: IGraph<TValue, TSet>): void;
}
