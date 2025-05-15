"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const complexityAnalyzer_1 = require("./complexityAnalyzer");
const decorator_1 = require("./decorator");
const hoverProvider_1 = require("./hoverProvider");
const statusBar_1 = require("./statusBar");
function activate(context) {
    const outputChannel = vscode.window.createOutputChannel('Code Complexity');
    const statusBar = new statusBar_1.StatusBar();
    const analyzer = new complexityAnalyzer_1.ComplexityAnalyzer(outputChannel);
    const decorator = new decorator_1.ComplexityDecorator(analyzer);
    const hoverProvider = new hoverProvider_1.ComplexityHoverProvider(analyzer);
    // Register providers
    context.subscriptions.push(vscode.languages.registerHoverProvider([
        { language: 'javascript' },
        { language: 'typescript' },
        { language: 'python' },
        { language: 'java' }
    ], hoverProvider));
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('complexity.showReport', () => {
        analyzer.generateReport();
    }));
    // Handle document changes
    vscode.workspace.onDidChangeTextDocument(event => {
        var _a;
        if (((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document) === event.document) {
            decorator.updateDecorations(event.document);
        }
    });
    // Handle active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            decorator.updateDecorations(editor.document);
            statusBar.update(analyzer.getFileComplexity(editor.document));
        }
    });
    // Initial decoration of active editor
    if (vscode.window.activeTextEditor) {
        decorator.updateDecorations(vscode.window.activeTextEditor.document);
        statusBar.update(analyzer.getFileComplexity(vscode.window.activeTextEditor.document));
    }
    outputChannel.appendLine('Live Code Complexity Visualizer is now active!');
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
