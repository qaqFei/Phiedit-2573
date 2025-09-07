/* eslint-disable */
import { reactive } from "vue";
import Manager from "./abstract";
import { NotReadonly } from "@/tools/typeTools";
export enum BottomText { 
    None, 
    Hint,
    Info
};
export const defaultSettings = {
    hitSoundVolume: 1,
    musicVolume: 1,
    backgroundDarkness: 90,
    lineThickness: 5,
    lineLength: 4000,
    textSize: 50,
    noteSize: 175,
    wheelSpeed: 0.2,
    judgeLineNumberRadix: 10,
    showJudgeLineNumber: true,
    bottomText: BottomText.Hint,
    markCurrentJudgeLine: true,
    autoCheckErrors: false,
    autoHighlight: true,
};
export default class SettingsManager extends Manager {
    _settings: NotReadonly<typeof defaultSettings> = { ...defaultSettings };
    settings = reactive(this._settings)
    constructor() {
        super();
        window.electronAPI.readSettings().then((settings) => {
            if (!settings) return;
            for (const key in settings) {
                if (key in this.settings) {
                    (this.settings[key as keyof typeof this.settings]) = settings[key as keyof typeof settings];
                }
            }
        })
    }
    setToDefault() {
        for (const key in defaultSettings) {
            (this.settings[key as keyof typeof this.settings] as any) = defaultSettings[key as keyof typeof defaultSettings];
        }
    }
}