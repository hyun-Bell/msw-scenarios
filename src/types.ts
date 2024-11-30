// import {
//   DefaultBodyType,
//   MockedRequest,
//   ResponseResolver,
//   RestContext,
// } from 'msw';

/* ============================= */
/*         Type Definitions      */
/* ============================= */

/** HTTP method types */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// /** Endpoint definition */
// export interface EndpointDefinition {
//   method: HttpMethod;
//   path: string | RegExp;
//   presets: {
//     [presetName: string]: ResponseResolver<
//       MockedRequest<DefaultBodyType>,
//       RestContext
//     >;
//   };
// }

// /** List of endpoints */
// export type EndpointList = ReadonlyArray<EndpointDefinition>;

// /** Scenario type */
// export interface Scenario<Endpoints extends EndpointList> {
//   name: string;
//   actions: (action: Action<Endpoints>) => void;
// }

// /** List of scenarios */
// export type ScenarioList<Endpoints extends EndpointList> = ReadonlyArray<
//   Scenario<Endpoints>
// >;

// /** Valid HTTP methods from the endpoints */
// export type ValidMethods<Endpoints extends EndpointList> =
//   Endpoints[number]['method'];

// /** Valid paths for a given method */
// export type ValidPathsForMethod<
//   Endpoints extends EndpointList,
//   M extends ValidMethods<Endpoints>,
// > = Extract<Endpoints[number], { method: M }>['path'];

// /** Valid presets for a given method and path */
// export type PresetsFor<
//   Endpoints extends EndpointList,
//   M extends ValidMethods<Endpoints>,
//   P extends ValidPathsForMethod<Endpoints, M>,
// > = keyof Extract<Endpoints[number], { method: M; path: P }>['presets'];

// /** Extract endpoint for a method and path */
// export type EndpointFor<
//   Endpoints extends EndpointList,
//   M extends ValidMethods<Endpoints>,
//   P extends ValidPathsForMethod<Endpoints, M>,
// > = Extract<Endpoints[number], { method: M; path: P }>;

// /** Action type */
// export interface Action<Endpoints extends EndpointList> {
//   useMock<
//     M extends ValidMethods<Endpoints>,
//     P extends ValidPathsForMethod<Endpoints, M>,
//     Preset extends PresetsFor<Endpoints, M, P>,
//   >(config: {
//     method: M;
//     path: P;
//     preset: Preset;
//   }): void;

//   useRealAPI<
//     M extends ValidMethods<Endpoints>,
//     P extends ValidPathsForMethod<Endpoints, M>,
//   >(config: {
//     method: M;
//     path: P;
//   }): void;
// }

// /** MockManager API interface */
// export interface MockManagerAPI<
//   Endpoints extends EndpointList,
//   Scenarios extends ScenarioList<Endpoints>,
// > {
//   useMock: Action<Endpoints>['useMock'];
//   useRealAPI: Action<Endpoints>['useRealAPI'];
//   applyScenario: (name: Scenarios[number]['name']) => void;
//   removeScenario: (name: Scenarios[number]['name']) => void;
// }
