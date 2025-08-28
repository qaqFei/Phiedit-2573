import type { Note } from "@/models/note";
import type { ColorEvent, NumberEvent, TextEvent } from "./models/event";
export enum RightPanelState {
    Default, Clipboard, Settings, BPMList, Meta, JudgeLine, History, Calculator, NoteFill, EventFill, FastBind, Error
}
export enum MouseMoveMode {
    None, Drag, DragEnd, Select
}
export type SelectedElement = Note | NumberEvent | ColorEvent | TextEvent;

/** 把T中的A属性变为可选 */
export type Optional<T, A extends keyof T> = Omit<T, A> & Partial<Pick<T, A>>;

/** 把T中的A属性变为B类型 */
export type Replace<T, A extends keyof T, B> = Omit<T, A> & { [K in A]: B };