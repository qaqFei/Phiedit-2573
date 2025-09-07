const INDENT = 4;
module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true
    },
    extends: [
        "eslint:recommended",
        "plugin:vue/vue3-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2020,
        sourceType: "module"
    },
    plugins: [
        "vue",
        "@typescript-eslint"
    ],
    rules: {
        /**
         * 设置 Vue 文件中 HTML 内容的缩进为 4 个空格
         * 该规则确保 Vue 模板中的 HTML 元素以统一的缩进显示，提升代码可读性
         */
        "vue/html-indent": ["error", INDENT],

        /**
         * 设置 Vue 文件中组件名称为 PascalCase
         * 该规则确保组件名称遵循 PascalCase 格式，即每个单词首字母大写，以提升代码可读性
         */
        "vue/component-name-in-template-casing": ["error", "PascalCase"],

        /**
         * 强制所有语句以分号结束
         * 避免因省略分号可能导致的解析错误或意外行为
         */
        semi: ["error", "always"],

        /**
         * 强制使用 Stroustrup 大括号风格，也就是这种换行格式：  
         * if、else 等语句的左括号与语句头在同一行，右括号独占一行
         * ```typescript
         * if (condition) {
         *     doSomething();
         * }
         * else {
         *     doSomethingElse();
         * }
         * 
         * for (let i = 0; i < 10; i++) {
         *     console.log(i);
         * }
         * ```
         */
        "brace-style": ["error", "stroustrup"],

        /** 强制逗号后必须有空格，逗号前禁止空格 */
        "comma-spacing": ["error", {
            before: false,
            after: true
        }],

        /**
         * 强制中缀运算符两侧必须有空格
         * 禁用 32 位整数优化提示，保持运算符可读性优先
         */
        "space-infix-ops": ["error", {
            int32Hint: false
        }],

        /**
         * 强制操作符换行时必须放在行尾
         */
        "operator-linebreak": ["error", "after"],

        /**
         * 要求注释前面必须要有空行
         * 注释如果在第一行，前面可以不空行
         * 注释前面如果还是注释也可以不空行
         */
        "lines-around-comment": ["error", {
            beforeBlockComment: true,
            beforeLineComment: true,
            allowBlockStart: true,
            allowObjectStart: true,
            allowArrayStart: true,
            allowClassStart: true,

            // allowInterfaceStart: true,
        }],

        /**
         * 禁止使用行内注释
         */
        "no-inline-comments": ["error"],

        /**
         * 设置基础缩进为 4 个空格
         * 特殊处理 SwitchCase 缩进 1 级，变量声明对齐第一个变量
         */
        indent: ["error", INDENT, {
            SwitchCase: 1,
            VariableDeclarator: "first"
        }],

        /**
         * 强制多行语句必须使用大括号包裹
         */
        curly: ["error", "multi-line"],

        /** 
         * 要求多行的对象、函数、数组的最后一行和结尾的括号之间不能有空行 
        */
        "padded-blocks": ["error", {
            "blocks": "never",
            "classes": "never",
            "switches": "never"
        }],

        /** 
         * 要求属性名称使用驼峰式命名法 
         */
        camelcase: ["error", {
            properties: "always"
        }],

        /**
         * 强制使用 === 和 !==，禁止使用 == 和 !=
         */
        eqeqeq: ["error", "always"],

        /**
         * 强制使用双引号，禁止使用单引号
         */
        quotes: ["error", "double", {
            allowTemplateLiterals: true
        }],

        /**
         * 禁止使用 var，必须使用 let 或 const
         */
        "no-var": ["error"],

        /**
         * 禁止使用魔法数字，但有一些除外
         */
        "no-magic-numbers": ["error", {
            ignore: [
                // -1 是 find 函数未找到时的返回值
                -1,

                // 0 应该不用多说了吧
                0,

                // 有些时候要取数组的最后一项，要用到 arr[arr.length - 1]
                1,

                // 需要把某些东西除以 2 或乘以 0.5 来获取 canvas 的中心点等
                2, 0.5,

                // 
                3,

                // 用于把小数和百分数进行转换
                100,

                // 用于把秒和毫秒进行转换
                1000,

                // 用于对角度之类的东西进行处理
                180, 360, -180,

                // 用于对颜色或透明度之类的东西进行处理
                255,

                // 用于转换十进制、八进制和十六进制
                10, 8, 16,

                // 用于检测是否超出 32 位无符号/有符号整数
                0xffffffff, 0x100000000, -0xffffffff, -0x100000000,
                0x7fffffff, 0x80000000, -0x7fffffff, -0x80000000,
            ]
        }],

        /** 禁止在循环中定义函数 */
        "no-loop-func": "error"
    },
    overrides: [
        {
            files: ["*.vue"],
            parser: "vue-eslint-parser"
        },
        {
            files: ["*.json", "*.json5", "*.jsonc"],
            parser: "json",
            rules: {
                "comma-dangle": ["error", "never"]
            }
        }
    ]
};