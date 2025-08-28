import { NumberEvent, ColorEvent, TextEvent } from "./event";
import { Note } from "./note";

export default class ChartError {
    constructor(public message: string, public type: string, public object?: Note | NumberEvent | ColorEvent | TextEvent) { }
}