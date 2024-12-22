"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_router_1 = require("@generouted/react-router");
var core_1 = require("@tauri-apps/api/core");
var window_1 = require("@tauri-apps/api/window");
var plugin_cli_1 = require("@tauri-apps/plugin-cli");
var i18next_1 = require("i18next");
var client_1 = require("react-dom/client");
var react_i18next_1 = require("react-i18next");
var react_router_dom_1 = require("react-router-dom");
var PromptManager_1 = require("./core/ai/PromptManager");
var TextRiseEffect_1 = require("./core/effect/concrete/TextRiseEffect");
var KeyBinds_1 = require("./core/KeyBinds");
var LastLaunch_1 = require("./core/LastLaunch");
var MouseLocation_1 = require("./core/MouseLocation");
var RecentFileManager_1 = require("./core/RecentFileManager");
var EdgeRenderer_1 = require("./core/render/canvas2d/entityRenderer/edge/EdgeRenderer");
var renderer_1 = require("./core/render/canvas2d/renderer");
var Settings_1 = require("./core/Settings");
var SoundService_1 = require("./core/SoundService");
var Camera_1 = require("./core/stage/Camera");
var Stage_1 = require("./core/stage/Stage");
var StageHistoryManager_1 = require("./core/stage/stageManager/StageHistoryManager");
var EdgeCollisionBoxGetter_1 = require("./core/stageObject/association/EdgeCollisionBoxGetter");
var StageStyleManager_1 = require("./core/stageStyle/StageStyleManager");
var StartFilesManager_1 = require("./core/StartFilesManager");
require("./index.pcss");
var dialog_1 = require("./utils/dialog");
var popupDialog_1 = require("./utils/popupDialog");
var router = (0, react_router_dom_1.createMemoryRouter)(react_router_1.routes);
var Routes = function () { return <react_router_dom_1.RouterProvider router={router}/>; };
var el = document.getElementById("root");
// 建议挂载根节点前的一系列操作统一写成函数，
// 在这里看着清爽一些，像一个列表清单一样。也方便调整顺序
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var t1, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 7]);
                t1 = performance.now();
                return [4 /*yield*/, Promise.all([
                        Settings_1.Settings.init(),
                        RecentFileManager_1.RecentFileManager.init(),
                        LastLaunch_1.LastLaunch.init(),
                        StartFilesManager_1.StartFilesManager.init(),
                        PromptManager_1.PromptManager.init(),
                        KeyBinds_1.KeyBinds.init(),
                    ])];
            case 1:
                _a.sent();
                // 这些东西依赖上面的东西，所以单独一个Promise.all
                return [4 /*yield*/, Promise.all([
                        loadLanguageFiles(),
                        loadSyncModules(),
                        loadStartFile(),
                    ])];
            case 2:
                // 这些东西依赖上面的东西，所以单独一个Promise.all
                _a.sent();
                return [4 /*yield*/, renderApp()];
            case 3:
                _a.sent();
                console.log("\u5E94\u7528\u521D\u59CB\u5316\u8017\u65F6\uFF1A".concat(performance.now() - t1, "ms"));
                KeyBinds_1.KeyBinds.create("test", "t", {
                    control: true,
                    alt: true,
                    shift: true,
                }).then(function (bind) { return bind.down(function () { return dialog_1.Dialog.show({ title: "test" }); }); });
                return [3 /*break*/, 7];
            case 4:
                e_1 = _a.sent();
                console.error(e_1);
                return [4 /*yield*/, (0, window_1.getCurrentWindow)().setDecorations(true)];
            case 5:
                _a.sent();
                return [4 /*yield*/, (0, core_1.invoke)("devtools")];
            case 6:
                _a.sent();
                document.body.style.backgroundColor = "black";
                document.body.style.color = "white";
                document.body.style.userSelect = "auto";
                document.body.innerHTML = "\u5E94\u7528\u521D\u59CB\u5316\u5931\u8D25\uFF0C\u8BF7\u622A\u56FE\u6B64\u7A97\u53E3\uFF0C\u7136\u540E\u52A0\u5165QQ\u7FA41006956704\u53CD\u9988\u6216\u5728GitHub\u4E0A\u63D0\u4EA4issue(https://github.com/LiRenTech/project-graph/issues) ".concat(String(e_1));
                return [2 /*return*/];
            case 7: return [2 /*return*/];
        }
    });
}); })();
/** 加载同步初始化的模块 */
function loadSyncModules() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            EdgeCollisionBoxGetter_1.EdgeCollisionBoxGetter.init();
            EdgeRenderer_1.EdgeRenderer.init();
            renderer_1.Renderer.init();
            Camera_1.Camera.init();
            Stage_1.Stage.init();
            StageHistoryManager_1.StageHistoryManager.init();
            StageStyleManager_1.StageStyleManager.init();
            SoundService_1.SoundService.init();
            MouseLocation_1.MouseLocation.init();
            return [2 /*return*/];
        });
    });
}
/** 加载语言文件 */
function loadLanguageFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _b = (_a = i18next_1.default.use(react_i18next_1.initReactI18next)).init;
                    _e = {};
                    return [4 /*yield*/, Settings_1.Settings.get("language")];
                case 1:
                    _e.lng = _g.sent(),
                        _e.debug = import.meta.env.DEV,
                        _e.defaultNS = "",
                        _e.fallbackLng = "zh-CN";
                    _f = {};
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("./locales/en.yml"); }).then(function (m) { return m.default; })];
                case 2:
                    _f.en = _g.sent();
                    _c = "zh-CN";
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("./locales/zh-CN.yml"); }).then(function (m) { return m.default; })];
                case 3:
                    _f[_c] = _g.sent();
                    _d = "zh-TW";
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("./locales/zh-TW.yml"); }).then(function (m) { return m.default; })];
                case 4:
                    _b.apply(_a, [(_e.resources = (_f[_d] = _g.sent(),
                            _f),
                            _e)]);
                    return [2 /*return*/];
            }
        });
    });
}
/** 加载用户自定义的工程文件，或者从启动参数中获取 */
function loadStartFile() {
    return __awaiter(this, void 0, void 0, function () {
        var cliMatches, path, isExists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, plugin_cli_1.getMatches)()];
                case 1:
                    cliMatches = _a.sent();
                    path = "";
                    if (!cliMatches.args.path.value) return [3 /*break*/, 2];
                    path = cliMatches.args.path.value;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, StartFilesManager_1.StartFilesManager.getCurrentStartFile()];
                case 3:
                    path = _a.sent();
                    _a.label = 4;
                case 4:
                    if (path === "") {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, core_1.invoke)("check_json_exist", {
                            path: path,
                        })];
                case 5:
                    isExists = _a.sent();
                    if (isExists) {
                        // 打开自定义的工程文件
                        RecentFileManager_1.RecentFileManager.openFileByPath(path);
                        setTimeout(function () {
                            // 更改顶部路径名称
                            RecentFileManager_1.RecentFileManager.openFileByPathWhenAppStart(path);
                        }, 1000);
                    }
                    else {
                        // 自动打开路径不存在
                        Stage_1.Stage.effects.push(new TextRiseEffect_1.TextRiseEffect("\u6253\u5F00\u5DE5\u7A0B\u5931\u8D25\uFF0C".concat(path, "\u4E0D\u5B58\u5728\uFF01")));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/** 渲染应用 */
function renderApp() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            (0, client_1.createRoot)(el).render(<popupDialog_1.PopupDialogProvider>
      <Routes />
    </popupDialog_1.PopupDialogProvider>);
            return [2 /*return*/];
        });
    });
}
