# 贡献指南

## 如何参与开发我的项目

1. 请先安装 [Node.js](https://nodejs.org/zh-cn/download) 和 [Git](https://git-scm.com/downloads)。
2. 确保你可以稳定访问到 Github 页面，如果不能，请在你的 `C:\Windows\System32\drivers\etc\hosts` 文件中添加以下内容（记得把原文件备份一份）：

    ```plaintext
    20.205.243.166 github.com
    174.37.175.229 global.ssl.fastly.net
    185.199.111.153 assets-cdn.github.com
    185.199.109.153 assets-cdn.github.com
    185.199.108.153 assets-cdn.github.com
    185.199.110.153 assets-cdn.github.com
    20.205.243.165 codeload.github.com
    31.13.71.19 github.global.ssl.fastly.net
    ```

    或者你也可以把域名中的 `github.com` 替换成 `kkgithub.com`（GitHub 镜像网站）。
3. 点击 GitHub 页面右上角的 “Fork” 按钮，创建一个 fork（就是把我的项目给你复制一份的意思）。
4. 创建一个文件夹，在文件夹中右键，点击菜单中的 Git Bash Here，打开命令行窗口。
5. 输入以下命令，把项目克隆到本地（就是把项目下载下来的意思）。

    ```bash
    git clone https://github.com/你的用户名/Phiedit-2573.git
    ```

6. 双击运行根目录下的 [install.cmd](install.cmd) ，**直接回车**安装依赖。
   或者你也可以使用 `npm install` 安装依赖。
7. 双击运行根目录下的 [dev.cmd](dev.cmd) 启动项目。
   或者你也可以手动输入命令 `npm run electron:dev`。
8. 开始你的开发
9. 基于 dev 分支创建功能分支（你开发完的代码就会在这个分支里）。

    ```bash
    git checkout -b 你的功能名 dev
    ```

10. 提交代码并推送至你的 Fork 仓库（要推送到功能分支里）。

    ```bash
    git add .
    git commit -m "你的提交信息，对你的修改做了哪些进行描述"
    git push origin 你的功能名
    ```

11. 在 GitHub 上提交 Pull Request，在 Pull Request 的信息中关联对应 Issue（就是向我申请，要把你的修改合并到 dev 分支里的意思）。
12. 等待审核。审核通过后，恭喜你，你已经给这个项目的开发做出了贡献！
<!-- 12. 发布新版本时，我会按下面步骤把 dev 分支的代码合并到 master 分支，并打上版本号（**你不需要运行这些命令**）：
1.  `git fetch origin`（下载远程仓库的代码）
2.  `git checkout master`（切换到 master 分支）
3.  `git merge dev`（把本地的 dev 分支的代码合并到 master 分支）
4.  `git push origin master`（把本地代码推送到远程仓库）
5.  `git tag -a v新的版本号 -m "release 新的版本号"`（给新的版本打标签）
6.  `git push origin v新的版本号`（把标签推送到远程仓库）
7.  把需要发布的文件打包为zip压缩包
8.  `gh release create v新的版本号 "dist_electron/Phiedit 2573 v新的版本号.zip"`（发布新的版本） -->

## 文件目录结构解释

- [managers](src/managers): 管理器，用于实现各种功能，比如[复制粘贴](src/managers/clipboard.ts)，[鼠标框选](src/managers/mouse.ts)等等。
  [managers/render](src/managers/render) 是专门用来把内容渲染到 canvas 上的。
- [tools](src/tools): 各种工具，可跨项目通用。
- [models](src/models): 各种类，例如[谱面类](src/models/chart.ts)，[音符类](src/models/note.ts)，[事件类](src/models/event.ts)等等。
- [panels](src/panels): 侧边栏的 Vue 组件，显示在界面左右两侧。
- [myElements](src/myElements): 一些自定义的 Vue 组件，看起来与 Element Plus 的组件一模一样。有[输入框](src/myElements/MyInput.vue)，[下拉菜单](src/myElements/MySelect.vue)，[开关](src/myElements/MySwitch.vue)等等。
  输入框、下拉菜单等组件也分很多种，比如[拍数输入框](src/myElements/MyInputBeats.vue)，[数字输入框](src/myElements/MyInputNumber.vue)，[缓动下拉菜单](src/myElements/MySelectEasing.vue)等等，用来处理不同类型的输入数据。
  也含有一些 Element Plus 没有的组件，比如[计算器组件](src/myElements/MyCalculator.vue)。
- [views](src/views): 界面的各个页面，目前只有[首页](src/views/HomePage.vue)和[谱面编辑页](src/views/EditorPage.vue)两个页面。
- [eventEmitter.ts](src/eventEmitter.ts): 用于分发消息，实现发布订阅模式，联结各个 managers 和 Vue 组件之间的消息传递。
- [store.ts](src/store.ts): 数据集中管理，用于在各个 managers 和 Vue 组件中传递数据。
- [background.ts](src/background.ts): Electron 的主线程，用于处理一些文件操作，如添加谱面、打开谱面、删除谱面等。
- [preload.ts](src/preload.ts): Electron 的预加载线程，定义了 `window.electronAPI`，用于把主线程的操作转发给渲染线程。
- [main.ts](src/main.ts): Electron 的渲染线程。
- [router.ts](src/router.ts): 路由管理，用于定义路由。
- [constants.ts](src/constants.ts): 一些设置项，写死在代码里，用户不可更改。
- [Root.vue](src/views/Root.vue): 根组件，用于管理 [views](src/views) 下的页面。
<!-- 不知道为啥，eslint 非得规定组件名字必须有多个单词，搞得我不能用 Root 做组件名了，还得用 MainRoot -->
- 其他文件: 含有一些比较杂乱的文件，正在考虑优化和重构。

（这些文件都是在src目录下的，你不会还在根目录下找文件吧？不会吧？）

## 注意事项

### 分层架构

项目遵循分层架构原则，文件的依赖等级从高到低分别是：

1. [main.ts](src/main.ts)
2. [Root.vue](src/Root.vue)
3. [views 下的文件](src/views/)
4. [panels 下的文件](src/panels/)
5. [managers 下的文件](src/managers/)
6. [store.ts](src/store.ts)
7. [constants.ts](src/constants.ts)、[eventEmitter.ts](src/eventEmitter.ts)
8. [* myElements 下的文件](src/myElements/)
9. [* models 下的文件](src/models/)
10. [* tools 下的文件](src/tools/)
11. 第三方库
文件只能依赖比该文件依赖等级更低的文件，标星号的还可以直接依赖同级的文件。
特殊说明：
除了 [main.ts](src/main.ts) 以外，请不要在 Typescript 文件中直接引用 Vue 文件。
[store.ts](src/store.ts) 是一个特殊的文件，它可以引用 [managers 下的文件](src/managers/)，但只能引用类型，不能使用构造函数。
[managers](src/managers/) 可以通过 [store.ts](src/store.ts) 提供的 useManager() 方法 引用其他 managers。
例如：

```typescript
// store.ts
import { Note } from "@/models/note"; // ✅可以引用 models 下的文件
import ClipboardManager from "@/managers/clipboard"; // ❌不能引用 managers 下的文件
import type ClipboardManager from "@/managers/clipboard"; // ✅可以只引用类型，引用 managers 下的文件
import MyInput from "@/myElements/MyInput.vue"; // ❌不能引用 Vue 文件
```

### 单一职责

- 项目遵循单一职责原则，请确保每个 manager 只负责一个功能。
- 如果你的函数或方法名中出现 `and`、`or` 等连词，请考虑将其拆分为多个函数或方法。
- 如果你发现一个文件的代码行数过多，请考虑将其拆分为多个文件。正常情况下，一个文件的代码行数应该在 50~150 行左右。
- [panels](src/panels) 中的文件应该只是 Vue 组件，不应该代替 [managers](src/managers) 中文件的功能。

### 命名规则

- 函数和变量命名应该使用小驼峰命名法，例如 `myVariable`、`myFunction`。
- 类和组件的命名应该使用大驼峰命名法，例如 `MyClass`、`MyComponent`。
- HTML 的 class 名和 id 名应该使用小写短横线命名法，例如 `.my-class`、`#my-id`。
- 常量名称以及 [eventEmitter.ts](src/eventEmitter.ts) 中的事件名称应该使用大写下划线命名法，例如 `MY_CONSTANT`、`MY_EVENT_NAME`。
- 变量应该以名词或名词性短语命名，例如 `store`、`judgeLineNumber`。
- 表示数量或数组长度的变量应该以名词的复数或 `xxxCount`、`xxxLength` 等方式命名，例如 `lines`、`judgeLinesCount`。
- 数组应该以名词的复数或 `xxxList`、`xxxArray` 等方式命名，例如 `selectedElements`、`judgeLineList`。
- 函数应该以动词或动词性短语命名，例如 `select`、`addJudgeLine`。
- 类中的属性不需要再把类名重复一遍，例如 `event.eventType` 应该改为 `event.type`。
- 以 `xxxUtils` 命名的类中应该只含有 `static` 方法或属性，不能有构造函数、实例方法或属性。
- [eventEmitter.ts](src/eventEmitter.ts) 中的事件名称若为“动词_名词”或“动词”的格式，则代表“用户想干这件事情”，
  事件名称若为“名词_动词”或“名词_动词过去分词”的格式，则代表“这件事情已经发生了”。
  例如：
  `CHANGE_JUDGE_LINE` 表示“用户想要切换判定线”，应该在用户按下切换判定线的按钮或快捷键时发出该事件，在业务代码中监听该事件并实现切换判定线的具体逻辑。
  `JUDGE_LINE_CHANGED` 表示“用户已经切换了判定线”，应该在切换判定线的具体代码中应该发出该事件，以通知其他模块，其他模块可以监听该事件以更新判定线信息。
- 布尔类型的变量或属性应该以 `isXxx`、`hasXxx` 或 `canXxx` 等形式命名。
- 含义相反的方法、属性、变量、函数应该以反义词命名，如下：

| 正义       | 反义                 |
| ---------- | -------------------- |
| `add`      | `remove` 或 `delete` |
| `get`      | `set`                |
| `start`    | `end`                |
| `enable`   | `disable`            |
| `open`     | `close`              |
| `show`     | `hide`               |
| `min`      | `max`                |
| `play`     | `pause`              |
| `up`       | `down`               |
| `left`     | `right`              |
| `top`      | `bottom`             |
| `above`    | `below`              |
| `positive` | `negative`           |
| `before`   | `after`              |
| `visible`  | `hidden`             |
| `allow`    | `deny`               |
| `increase` | `decrease`           |
| `success`  | `failure`            |
| `accept`   | `reject`             |
| `create`   | `destroy`            |

对于无明确反义词的场景，可在词前直接添加 `un`、`dis` 或 `not` 等前缀。

### 代码格式

- 请经常使用代码编辑器的格式化功能统一代码格式。Visual Studio Code（以下简称 VSCode）中，格式化代码的快捷键为 Shift+Alt+F。
- 缩进使用 4 个空格。如果你用的也是 VSCode，请点击界面下方的“Tab Size: 4”或类似的文字，并点击“Indent Using Spaces”，点击数字 4，那个文字应该会变为“Spaces: 4”。设置完成后，请按 Shift+Alt+F 重新格式化代码。
- 使用 Vue 组件时，每个属性都要换一行。如果超过 2 个属性，或者一个属性占了多行，则第一个属性和开头的尖括号之间要换行，最后一个属性和结尾的尖括号之间也要换行。如果你用的也是 VSCode，请把 `html.format.wrapAttributes` 设置为 `force-expand-multiline`。
- 大多数代码格式规则都在 eslint 配置中设置了，在编写时，如果出现了错误，你应该能收到错误提示。下列均为 eslint 中没有配置的规则，请自行遵守。
- 对于较长的函数调用，应该遵循下面的换行格式：

```typescript
/*
不管参数列表中是否有对象或函数，
只要函数调用的代码太长了，
就可以按照这个格式换行，
开头和结尾的括号不换行，
每个参数的逗号后面换行
*/
method(ifThe * (parameter + contains + a + very + complex + expression
        + or + a.veryLongAttributeNameWithSevenWords),
    [
        "you should split it into",
        "multiple lines"
    ],
    2,
    5,
    7,
    3);

/*
参数列表中有且仅有一个对象时，
函数和对象之间不换行，
但大括号和对象内部的属性之间要换行
*/
method([1, 1, 4, 5, 1, 4], {
    it: contains,
    an: object
}, "a string param");


/*
参数列表中有且仅有一个函数时，
外部函数和回调函数之间不换行，
但大括号和里面的代码之间要换行
*/
method([1, 1, 4, 5, 1, 4], (it, has, a, callback, function_) => {
    ...
}, "a string param");


/*
参数列表中含有多个对象或函数时，
小括号和对象或函数之间要换行
*/
method(
    {
        it: contains,
        an: object
    },
    (and, a, callback, function_) => {
        ...
    },
    "and a string param",
    {
        and: "another object"
    }
);
```

### 文档格式

- 如果你使用的是 VSCode，请安装 `markdownlint` 插件，并按照其中的规则编写文档。你可以使用 Quick Fix 功能中的 “Fix all supported markdownlint violations in the document” 来自动修复报错，然后再手动修复剩余的报错。下列均为 markdownlint 中没有配置的规则，请自行遵守。
- 中英文之间、中文和数字之间要加空格。英文和标点符号之间、数字和标点符号之间不加空格。
- 完整的话后面要加句号。如果只是一个短语，则不用加句号。
- 如果要使用简称，第一次出现时请用全称，并在括号中注明“以下简称xxx”。

### 开发流程规范

- 需要添加新功能时，请按以下步骤操作：
    1. 在 [managers](src/managers) 目录下新建一个文件，使用 `export default class 类名 extends Manager { ... }` 定义一个管理器类，实现相应的代码。
    2. 在 [eventEmitter.ts](src/eventEmitter.ts) 的 `EventMap` 接口中添加相应的事件名称。
    3. 在 [store.ts](src/store.ts) 中的 `Store.managers` 字段中新增一个字段来存储新增的管理器。
    4. 可能需要在 [panels](src/panels) 下新建一个侧边栏的 Vue 组件，并实现相应的界面。添加了 Vue 组件后，请在 [RightPanelState](src/managers/state.ts) 中添加相应的字段。
    5. 为了能进入上一步的界面，需要在 [编辑器界面](src/views/EditorPage.vue) 中添加一个按钮。
    6. 在你需要的地方调用 [`globalEventEmitter.emit("你的事件名称", 参数)`](src/eventEmitter.ts)。
    7. 在 [EditorPage.vue](src/views/EditorPage.vue#L701) 中导入你定义的类，调用构造函数，创建实例，并设置进 [`store`](src/store.ts) 对象中。

### 数据使用规范

- 如果你要在 [managers](src/managers/) 中使用其他 managers 的数据或方法，请使用 [store.useManager()](src/store.ts) 方法。
- 如果你要获取任何数据，例如谱面或资源包，必须使用 [store.ts](src/store.ts) 所提供的方法，如 `useChart()`、`useChartPackage()`、`useResourcePackage()` 等。
- 所有添加、删除音符或事件的操作都应该使用 [store.ts](src/store.ts) 提供的方法。添加之后，请确保你使用了 [historyManager](src/managers/history.ts) 来记录该操作的历史记录。
- [store.ts](src/store.ts) 的生命周期从打开软件开始一直到关闭软件，所以在组件卸载时，请手动把不需要的数据设为 `null`。

### 代码质量要求

- 请遵循 eslint 中的规则。你可以使用 `npm run lint` 检查你是否有 eslint 错误。如果有，应该是会有错误提示的。
- 实在无法避免的 eslint 错误，请使用 eslint 禁用注释、`ts-ignore`、忽略类型检查或 `as any` 等手段。
- 但只有在你 100% 确定代码不会有运行时错误的情况下，才能使用，且不建议过多使用。
- 如果你认为某些 eslint 规则不符合你的要求，请修改 `.eslintrc.js` 文件。
- 普通对象只能含有属性，不能含有方法。
- [src](src) 下的所有代码文件都应该是 Typescript 文件，Vue 组件中也应该使用 `<script setup lang="ts">`。不要出现 `.js` 文件。（当然，配置文件除外）
- 对于AI（人工智能）写的或请他人写的代码，请确保你理解了这段代码的意思再加进项目中。（实话实说，这个项目里真的有很多用 AI 生成的代码或文档）
- 对于较复杂难理解的逻辑，请添加注释，以确保他人能够理解你的代码。请尽量使用文档注释而不是普通注释，因为文档注释可以被你的代码编辑器识别，并显示在代码提示中。
- 用户传入的参数有误时，不要直接 return。请使用 `throw new Error()` 抛出一个错误，并在 [`globalEventEmitter.on()`](src/eventEmitter.ts) 中使用 [`createCatchErrorByMessage()`](src/tools/catchError.ts) 包裹住函数以捕获错误，这样该错误会在界面的顶部显示为一个弹窗。
- 路径的拼接请使用 `path` 库中的 `path.join()` 方法，不要直接把字符串相加，也不要使用模板字符串拼接。
- Javascript 中，对负数做取模运算仍会返回负数。如果这不合你的预期，请使用 [`MathUtils.mod`](src/tools/mathUtils.ts) 函数来处理负数的取模运算。
- 不要用 `var` 定义变量，请使用 `let` 或 `const`。如果变量没有被修改过，必须使用 `const`。

### UI 组件规范

- 遇到用户可能比较难懂的术语时，使用 [MyQuestionMark.vue](src/myElements/MyQuestionMark.vue) 的问号组件来进行解释。
- HTML 元素应该是语义化的。例如，我想添加一个一级标题，但 `<h1>` 元素的字号太大了，则应该调整 `<h1>` 元素的样式，而不是使用 `<h2>` 元素。
- 请使用 `<em>` 元素表示需要强调的内容。[index.html](public/index.html) 中已经为 `<em>` 元素设置了样式。
- 在 [myElements](src/myElements) 和 [panels](src/panels) 目录下的 Vue 组件中，`<style>` 必须使用 `scoped` 属性。
- 不要直接使用 `ElButton` 组件，而是使用[封装后的 `MyButton` 组件](src/myElements/MyButton.vue)。因为 `ElButton` 按钮按下后再按空格键，会触发点击事件，而空格键又是暂停和播放音乐的快捷键，导致用户按完按钮后想播放一下音乐，但实际又触发了一次按钮，影响体验。封装组件已避免该问题。
- 不要用 `v-model` 绑定非响应式数据。如果真的需要，请在组件内创建一个响应式数据，并手动同步响应式数据和非响应式数据。

### 其他

- 不要轻易升级或降级依赖，因为在这可能会带来一些非常难解决的问题。
- 其他的规则有可能在代码的注释中给出，请自行查看。

## Pull Request 审核标准

- Pull Request 的目标分支必须是 dev（开发分支），而非 master（主分支）。
- Pull Request 的描述中必须包含以下内容：
  
  - 修改目的（如修复 Bug、新增功能）
  - 关联的 Issue 编号（如 Closes #123）
  - 测试情况（如是否通过 [build.cmd](build.cmd) 构建测试）

- 需遵守 [Commit 规范](https://www.conventionalcommits.org/zh-hans/)。
- 需通过 [build.cmd](build.cmd) 构建测试，编译后的安装包安装后可以正常运行无 bug。
- 需遵循本文件 [注意事项](#注意事项) 部分的规定，旨在防止代码成为“屎山代码”。
- 请在提交前删除或注释掉所有的 `console.log()` 等用来调试的语句，`console.warn()` 和 `console.error()` 除外。
- 请在提交前去掉所有未被使用的模块。
- 请在提交前去掉所有未被使用的依赖。

## 备注

本项目作者第一次发布开源项目，对于 Github 平台的开发逻辑还不是很懂，所以本文档的 [如何参与开发我的项目](#如何参与开发我的项目) 和 [Pull Request 审核标准](#pull-request-审核标准) 部分的内容大多为 AI 生成，可能会有错误，欢迎指正。
本项目作者是个学生党，有可能无法及时处理 Pull Request。
