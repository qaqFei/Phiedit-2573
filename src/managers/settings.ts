import { reactive } from "vue";
import Manager from "./abstract";
export const defaultSettings = {
    backgroundDarkness: 90,
    lineWidth: 5,
    lineLength: 4000,
    textSize: 50,
    noteSize: 175,
    wheelSpeed: 0.5,
    autoplayOffset: 0,
    showJudgeLineNumber: true,
    showEventValues: false,
    markCurrentJudgeLine: true,
} as const;
export default class SettingsManager extends Manager {
    _settings: typeof defaultSettings = { ...defaultSettings };
    constructor() {
        super();
        window.electronAPI.readSettings().then((settings) => {
            if (!settings) return;
            for (const key in settings) {
                if (key in this._settings) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (this._settings[key as keyof typeof this._settings] as any) = settings[key as keyof typeof settings];
                }
            }
        })
    }
    settings = reactive(this._settings)
    setToDefault() {
        for (const key in defaultSettings) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.settings[key as keyof typeof this._settings] as any) = defaultSettings[key as keyof typeof defaultSettings];
        }
    }
}