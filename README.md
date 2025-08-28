# Phiedit 2573（Made by [@程序小袁_2573](https://space.bilibili.com/522248560)，目前最新版为v0.1.0）

## 项目介绍
Phiedit 2573 是一款基于 Vue-Electron 框架开发的 Phigros 谱面编辑器，编程语言为 Javascript，使用了 npm 包管理器，界面采用 Element Plus 组件库。
该项目从 2024 年的暑假开始开发，软件的设计参考了[@cmdysj](https://space.bilibili.com/252635690)的同类项目 Re:PhiEdit（以下简称 RPE），所以有很多功能都与 RPE 相同。除了 RPE 以外，本项目也借鉴了其他的开源代码和 AI 生成的代码。

## 我这个制谱器也有一些未修复的bug和未实现的功能
1. 不支持编辑shader
2. 我打算以后给这个软件增加游玩谱面和渲染谱面的功能，但这不是主要功能，所以没做
3. 性能差，当音符和事件特别多时FPS就会掉到30以下
4. 界面上没有分数、连击数、曲名等UI，也不支持UI绑定，如果想控分数/控连击数，请看顶部工具栏的分数/连击数
5. Hold 的打击特效频率是写死在程序里的，不能跟随 BPM 的变化而变化
6. 不支持`bpmfactor`、`alphaControl`、`posControl`、`sizeControl`、`skewControl`、`yControl`，因为不清楚这几个属性的含义
7. 导出的谱面导入进RPE会闪退，导入进[lchzh3473的模拟器](https://lchzh3473.github.io/sim-phi/)却没有任何问题，不知道是我软件的bug，还是RPE的bug
8. 还有一些未发现的bug，如果你发现了bug或者有好的建议，请在issue中提出，或者进入[我的bilibili个人空间](https://space.bilibili.com/522248560)后发送私信给我！

## 参与开发  
想为本项目做贡献？请阅读[贡献指南](CONTRIBUTING.md)并从下方任务列表开始！