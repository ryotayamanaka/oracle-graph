/*
 * Copyright (C) 2013, 2022, Oracle and/or its affiliates.
 * ORACLE PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
type Optional<T> = T | undefined;

type Nullable<T> = T | null;

type TypedMap<T> = Record<string, T>;

type NestedPartial<T> = {
  [P in keyof T]?: NestedPartial<T[P]>;
};

type NestedFlags<T> = {
  [P in keyof T]?: T[P] extends object ? false | NestedFlags<T[P]> : T[P];
};

type NestedExpressions<T> = {
  [P in keyof T]: T[P] extends Nullable<Optional<object>> ? NestedExpressions<T[P]> : T[P] | string;
};

type Shortcuts<T> = {
  [P in keyof T]: T[P] extends Nullable<Optional<object>> ? string | T[P] : T[P];
};

type PartialStyle<T> = Shortcuts<NestedExpressions<NestedPartial<T>>>;

type NestedPartialStyle<T> = Omit<PartialStyle<T>, 'children'> & {
  children?: Nullable<TypedMap<PartialStyle<_VertexStyle> & Classable>>;
};

type NonEmptyArray<T> = [T, ...T[]];

type AtLeastOneRequired<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

type Id = string | number;

interface Classable {
  classes?: string[];
}

interface Entity extends Classable {
  id: Id;
  properties?: TypedMap<Optional<string | number | boolean>>;
  style?: VertexStyle | EdgeStyle;
}

export interface Vertex extends Entity {}

export interface Edge extends Entity {
  source: Id;
  target: Id;
}

interface Paginable {
  numResults?: number;
}

export interface Graph extends Paginable {
  vertices: Vertex[];
  edges: Edge[];
}

export type FeatureFlags =
  | false
  | NestedFlags<{
      exploration: {
        expand: boolean;
        focus: boolean;
        group: boolean;
        ungroup: boolean;
        drop: boolean;
        undo: boolean;
        redo: boolean;
        reset: boolean;
      };
      modes: {
        interaction: boolean;
        fitToScreen: boolean;
        sticky: boolean;
      };
      pagination: boolean;
    }>;

type LayoutType = 'circle' | 'concentric' | 'force' | 'grid' | 'hierarchical' | 'preset' | 'radial' | 'random';

interface BaseLayoutSettings {
  type: LayoutType;
}

interface SpacingLayoutSettings {
  spacing: number;
}

interface CircleLayoutSettings extends BaseLayoutSettings, SpacingLayoutSettings {
  type: 'circle';
}

interface ConcentricLayoutSettings extends BaseLayoutSettings, SpacingLayoutSettings {
  type: 'concentric';
}

interface ForceLayoutSettings extends BaseLayoutSettings, SpacingLayoutSettings {
  type: 'force';
  alphaDecay: number;
  velocityDecay: number;
  edgeDistance: number;
  vertexCharge: number;
}

interface GridLayoutSettings extends BaseLayoutSettings, SpacingLayoutSettings {
  type: 'grid';
}

type HierarchicalRankDirection = 'UL' | 'UR' | 'DL' | 'DR' | 'TB' | 'BT' | 'LR' | 'RL';

type HierarchicalRanker = 'network-simplex' | 'tight-tree' | 'longest-path';

interface HierarchicalLayoutSettings extends BaseLayoutSettings {
  type: 'hierarchical';
  rankDirection: HierarchicalRankDirection;
  ranker: HierarchicalRanker;
  vertexSeparation?: number;
  edgeSeparation?: number;
  rankSeparation?: number;
}

interface PresetLayoutSettings extends BaseLayoutSettings {
  type: 'preset';
  x: string;
  y: string;
}

interface RadialLayoutSettings extends BaseLayoutSettings, SpacingLayoutSettings {
  type: 'radial';
}

interface RandomLayoutSettings extends BaseLayoutSettings {
  type: 'random';
}

type LayoutSettings =
  | CircleLayoutSettings
  | ConcentricLayoutSettings
  | ForceLayoutSettings
  | GridLayoutSettings
  | HierarchicalLayoutSettings
  | PresetLayoutSettings
  | RadialLayoutSettings
  | RandomLayoutSettings;

interface EvolutionEntity {
  start: string;
  end?: string;
}

interface Evolution {
  height: number;
  chart: 'bar' | 'line';
  granularity: number;
  unit?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  vertex?: EvolutionEntity;
  edge?: EvolutionEntity;
  exclude: {
    values: (string | number)[];
    show: boolean;
  };
  playback: {
    step: number;
    timeout: number;
  };
}

interface _Settings {
  pageSize: number;
  groupEdges: boolean;
  escapeHtml: boolean;
  layout: LayoutType | Partial<LayoutSettings>;
  evolution: NestedPartial<Shortcuts<Evolution>>;
}

interface ElementPosition {
  angle?: Nullable<number>;
  position: number;
  d: number;
}

interface FontStyle {
  size: number;
  family: string;
  style: string;
  weight: string;
}

interface LabelStyle extends ElementPosition {
  text: string;
  color: string;
  maxLength: number;
  font: FontStyle;
}

interface Style extends ElementPosition {
  color: string;
  opacity: number;
  filter: string;
  label: Nullable<LabelStyle>;
  children: Nullable<TypedMap<_VertexStyle & Classable>>;
  legend: Nullable<this & { text: string }>;
}

interface ImageStyle {
  url: string;
  scale: number;
}

interface BorderStyle {
  width: number;
  color: string;
}

interface IconStyle {
  class: string;
  color: string;
}

interface _VertexStyle extends Style {
  size: number;
  image: Nullable<ImageStyle>;
  border: Nullable<BorderStyle>;
  icon: Nullable<IconStyle>;
}

interface _EdgeStyle extends Style {
  width: number;
  dasharray?: string;
}

type EntityEventCallback = (event: Event, id: Optional<string>, entity: Entity) => void;

interface _EntityEventHandlers {
  [eventType: string]: EntityEventCallback | _EntityEventHandlers;
  children?: EntityEventHandlers;
}
interface _AllEventHandlers {
  vertex: EntityEventHandlers;
  edge: EntityEventHandlers;
}

export type Settings = Partial<_Settings>;

export type VertexStyle = NestedPartialStyle<_VertexStyle>;

export type EdgeStyle = NestedPartialStyle<_EdgeStyle>;

export type Styles = TypedMap<VertexStyle | EdgeStyle>;

export type EntityEventHandlers = Optional<_EntityEventHandlers>;

export type AllEventHandlers = Partial<_AllEventHandlers>;

export type Paginate = (start: number, size: number) => Promise<Graph>;

export type Expand = (ids: Id[], hops: number) => Promise<Graph>;

export type Persist = (action: GraphAction) => Promise<void>;

export type FetchActions = () => Promise<GraphAction[]>;

export type GraphActionType = 'drop' | 'expand' | 'focus' | 'group' | 'ungroup' | 'undo' | 'redo' | 'reset';

export interface GraphAction {
  type: GraphActionType;
  vertexIds?: NonEmptyArray<Id>;
  edgeIds?: NonEmptyArray<Id>;
}

export type EmptyAction = Pick<GraphAction, 'type'>;

export type VerticesAction = Pick<GraphAction, 'type' | 'vertexIds'>;

export type VerticesOrEdgesAction = AtLeastOneRequired<Pick<GraphAction, 'vertexIds' | 'edgeIds'>> & EmptyAction;

interface IComponentOptions<Props extends Record<string, any> = Record<string, any>> {
  target: Element | ShadowRoot;
  anchor?: Element;
  props?: Props;
  context?: Map<any, any>;
  hydrate?: boolean;
  intro?: boolean;
  $$inline?: boolean;
}

export interface SvelteComponentTyped<
  Props extends Record<string, any> = any,
  Events extends Record<string, any> = any,
  Slots extends Record<string, any> = any
> {
  $set(props?: Partial<Props>): void;
  $on<K extends Extract<keyof Events, string>>(type: K, callback: (e: Events[K]) => void): () => void;
  $destroy(): void;
  [accessor: string]: any;
}

export declare class SvelteComponentTyped<
  Props extends Record<string, any> = any,
  Events extends Record<string, any> = any,
  Slots extends Record<string, any> = any
> {
  constructor(options: IComponentOptions<Props>);
}

export default class extends SvelteComponentTyped<
  Partial<{
    data: Graph;
    settings: Settings;
    styles: Styles;
    featureFlags: FeatureFlags;
    paginate: Paginate;
    expand: Expand;
  }>
> {}
