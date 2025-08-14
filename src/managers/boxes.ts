import Constants from "@/constants";
import { NoteType } from "@/models/note";
import store from "@/store";
import { BoxWithData } from "@/tools/box";
import { SelectedElement } from "@/types";
import Manager from "./abstract";
import { BaseEventLayer, baseEventTypes, extendedEventTypes } from "@/models/eventLayer";

export default class BoxesManager extends Manager {
    calculateBoxes(): BoxWithData<SelectedElement>[] {
        const settingsManager = store.useManager("settingsManager");
        const stateManager = store.useManager("stateManager");
        const boxes = [];
        const canvas = store.useCanvas();
        const resourcePackage = store.useResourcePackage();

        const baseNoteSize = Constants.notesViewBox.width / canvas.width * settingsManager._settings.noteSize;

        for (const note of stateManager.currentJudgeLine.notes) {
            const noteX = note.positionX * (Constants.notesViewBox.width / canvas.width) + Constants.notesViewBox.left + Constants.notesViewBox.width / 2;
            if (note.type == NoteType.Hold) {
                const noteSkin = resourcePackage.getSkin(note.type, note.highlight);
                const noteScale = baseNoteSize / resourcePackage.getSkin(note.type, false).body.width;
                const noteWidth = noteSkin.body.width * note.size * noteScale;
                const noteStartY = stateManager.getAbsolutePositionYOfSeconds(note.cachedStartSeconds);
                const noteEndY = stateManager.getAbsolutePositionYOfSeconds(note.cachedEndSeconds);
                const box = new BoxWithData(noteEndY + noteSkin.end.height * noteScale, noteStartY - noteSkin.head.height * noteScale, noteX - noteWidth / 2, noteX + noteWidth / 2, note);
                boxes.push(box);
            }
            else {
                const noteSkin = resourcePackage.getSkin(note.type, note.highlight);
                const noteY = stateManager.getAbsolutePositionYOfSeconds(note.cachedStartSeconds);
                const noteScale = baseNoteSize / resourcePackage.getSkin(note.type, false).width;
                const noteWidth = noteSkin.width * note.size * noteScale;
                const box = new BoxWithData(noteY + noteSkin.height * noteScale / 2, noteY - noteSkin.height * noteScale / 2, noteX - noteWidth / 2, noteX + noteWidth / 2, note);
                boxes.push(box);
            }
        }
        const types = (() => {
            const eventLayer = stateManager.currentEventLayer;
            if (eventLayer instanceof BaseEventLayer) {
                return baseEventTypes;
            }
            else {
                return extendedEventTypes;
            }
        })()
        for (const [column, type] of Object.entries(types)) {
            const events = stateManager.currentEventLayer.getEventsByType(type);
            const eventX = Constants.eventsViewBox.width * (+column + 0.5) / types.length + Constants.eventsViewBox.left;
            for (const event of events) {
                const eventStartY = stateManager.getRelativePositionYOfSeconds(event.cachedStartSeconds);
                const eventEndY = stateManager.getRelativePositionYOfSeconds(event.cachedEndSeconds);
                boxes.push(new BoxWithData(
                    stateManager.absolute(eventEndY),
                    stateManager.absolute(eventStartY),
                    eventX - Constants.eventWidth / 2,
                    eventX + Constants.eventWidth / 2,
                    event));
            }
        }
        return boxes;
    }
}