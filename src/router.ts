// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from "@generouted/react-router/client";

export type Path =
  | `/`
  | `/info`
  | `/settings`
  | `/settings/about`
  | `/settings/ai`
  | `/settings/automation`
  | `/settings/control`
  | `/settings/github`
  | `/settings/performance`
  | `/settings/physical`
  | `/settings/plugins`
  | `/settings/sounds`
  | `/settings/visual`
  | `/test`
  | `/welcome`;

export type Params = {};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
