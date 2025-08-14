import type { Note } from "@/models/note";
import type { ColorEvent, NumberEvent, TextEvent } from "./models/event";
export enum RightPanelState {
    Default, Clipboard, Settings, BPMList, Meta, JudgeLine, History, Calculator, NoteFill, EventFill, FastBind
}
export enum MouseMoveMode {
    None, Drag, DragEnd, Select
}
export type SelectedElement = Note | NumberEvent | ColorEvent | TextEvent;