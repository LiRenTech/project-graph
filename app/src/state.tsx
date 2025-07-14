import { atom, createStore } from "jotai";
import { Project } from "./core/Project";
/**
 * 全局状态管理
 */

export const store = createStore();

export const projectsAtom = atom<Project[]>([]);
export const activeProjectAtom = atom<Project | undefined>(undefined);
