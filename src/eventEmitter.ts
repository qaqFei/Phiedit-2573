import type { Beats } from "./models/beats";
import type { NoteType } from "./models/note";
import EventEmitter from "./tools/eventEmitter";
type PositionX = number;
type PositionY = number;
type DeltaY = number;
type KeyOptions = {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
}

/**
 * 事件名称列表
 * 如要添加新事件，请在此添加，并在数组中规定每个参数的类型
 */
interface GlobalEventMap {
    MOUSE_LEFT_CLICK: [PositionX, PositionY, KeyOptions]
    MOUSE_RIGHT_CLICK: [PositionX, PositionY, KeyOptions]
    MOUSE_MOVE: [PositionX, PositionY, KeyOptions]
    MOUSE_UP: [PositionX, PositionY, KeyOptions]
    MOUSE_ENTER: []
    MOUSE_LEAVE: []
    WHEEL: [DeltaY]
    CTRL_WHEEL: [DeltaY]
    RENDER_FRAME: []
    RENDER_CHART: []
    RENDER_EDITOR: []
    CUT: []
    COPY: []
    PASTE: [Beats?]
    PASTE_MIRROR: [Beats?]
    DELETE: []
    SELECT_ALL: []
    UNSELECT_ALL: []
    MOVE_LEFT: []
    MOVE_RIGHT: []
    MOVE_UP: []
    MOVE_DOWN: []
    NEXT_JUDGE_LINE: []
    PREVIOUS_JUDGE_LINE: []
    CHANGE_JUDGE_LINE: []
    CHANGE_TYPE: [NoteType]
    PREVIEW: []
    STOP_PREVIEW: []
    MOVE_TO_JUDGE_LINE: [number]
    MOVE_TO_PREVIOUS_JUDGE_LINE: []
    MOVE_TO_NEXT_JUDGE_LINE: []
    REPEAT: []
    CLONE: []
    UNDO: []
    REDO: []
    EXIT: []
    SAVE: []
    EXPORT: [string]
    REPEAT_PARAGRAPH: []
    REVERSE: []
    SWAP: []
    STICK: []
    RANDOM: []
    DISABLE: []
    ENABLE: []
    FILL_NOTES: []
    FILL_EVENTS: []
    BIND_LINE: []
    CHECK_ERRORS: []
    AUTO_FIX_ERRORS: []
    MUTIPLE_EDIT: []

    SELECTION_UPDATE: []
    HISTORY_UPDATE: []
    ERRORS_FIXED: [number]
}
class GlobalEventEmitter extends EventEmitter<GlobalEventMap> {}
const globalEventEmitter = new GlobalEventEmitter();
export default globalEventEmitter;
