import { Chart, IChart } from "./chart";
export interface IChartPackage {
    chart: IChart;
    background: HTMLImageElement;
    musicSrc: string;
    textures: Record<string, HTMLImageElement>
}
export interface ChartConfig {
    backgroundDarkness: number,
    lineWidth: number,
    lineLength: number,
    textSize: number,
    chartSpeed: number,
    noteSize: number,
}
export class ChartPackage implements IChartPackage {
    chart: Chart;
    background: HTMLImageElement;
    musicSrc: string;
    textures: Record<string, HTMLImageElement>;
    constructor(chartPackage: IChartPackage) {
        this.chart = new Chart(chartPackage.chart);
        this.musicSrc = chartPackage.musicSrc;
        this.background = chartPackage.background;
        this.textures = chartPackage.textures;
    }
}

/*
优先寻找info.txt，若没有该文件，或者该文件里没有音乐、图片和json文件的路径，下一步
随机选一个json文件，看是否有META.song和META.background，若没有，下一步
根据后缀名随机选择符合条件的音乐、图片和json文件，若未找到，报错（找不到音乐/图片/json文件）
*/