/**
 * @deprecated - These types are maintained for backward compatibility only.
 * They will be removed in the next major version.
 * Please use the HandlerUtils* types instead.
 */

import type { Path } from 'msw';
import type { HttpMethodLiteral, PresetHandler } from './types';

/** @deprecated Use HandlerUtilsGetResponse instead */
export type InferHandlerResponse<H> =
  H extends PresetHandler<infer R, HttpMethodLiteral, Path, string> ? R : never;

/** @deprecated Use HandlerUtilsGetMethod instead */
export type InferHandlerMethod<H> =
  H extends PresetHandler<unknown, infer M, Path, string> ? M : never;

/** @deprecated Use HandlerUtilsGetPath instead */
export type InferHandlerPath<H> =
  H extends PresetHandler<unknown, HttpMethodLiteral, infer P, string>
    ? P
    : never;

/** @deprecated Use HandlerUtilsGetLabels instead */
export type InferHandlerLabels<H> =
  H extends PresetHandler<unknown, HttpMethodLiteral, Path, infer L>
    ? L
    : never;

/** @deprecated Use HandlerUtilsGetMethod instead */
export type ExtractMethod<H> =
  H extends PresetHandler<unknown, infer M, Path, string> ? M : never;

/** @deprecated Use HandlerUtilsGetPath instead */
export type ExtractPath<H> =
  H extends PresetHandler<unknown, HttpMethodLiteral, infer P, string>
    ? P
    : never;

/** @deprecated Use HandlerUtilsGetResponse instead */
export type ExtractResponseType<H> =
  H extends PresetHandler<infer R, HttpMethodLiteral, Path, string> ? R : never;
