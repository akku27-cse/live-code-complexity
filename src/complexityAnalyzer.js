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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexityAnalyzer = void 0;
const typhonjs_escomplex_1 = __importDefault(require("typhonjs-escomplex"));
const radon = __importStar(require("radon-js"));
class ComplexityAnalyzer {
    constructor(outputChannel) {
        this.cache = new Map();
        this.outputChannel = outputChannel;
    }
    analyzeDocument(document) {
        const cachedReport = this.cache.get(document.uri.toString());
        if (cachedReport) {
            return cachedReport;
        }
        const text = document.getText();
        let report;
        try {
            switch (document.languageId) {
                case 'javascript':
                case 'typescript':
                    report = this.analyzeJavaScript(text);
                    break;
                case 'python':
                    report = this.analyzePython(text);
                    break;
                case 'java':
                    // Java analysis would go here
                    report = this.createEmptyReport();
                    break;
                default:
                    report = this.createEmptyReport();
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Analysis error: ${error}`);
            report = this.createEmptyReport();
        }
        this.cache.set(document.uri.toString(), report);
        return report;
    }
    analyzeJavaScript(code) {
        const report = typhonjs_escomplex_1.default.analyzeModule(code);
        const functions = report.methods.map(method => ({
            name: method.name,
            line: method.lineStart,
            cyclomatic: method.cyclomatic,
            halsteadDifficulty: method.halstead.difficulty,
            halsteadEffort: method.halstead.effort,
            linesOfCode: method.sloc.logical
        }));
        return {
            functions,
            averageCyclomatic: report.cyclomatic,
            averageHalsteadEffort: report.halstead.effort,
            fileComplexity: report.maintainability
        };
    }
    analyzePython(code) {
        const analysis = radon.analyze(code);
        const functions = analysis.functions.map(func => ({
            name: func.name,
            line: func.lineno,
            cyclomatic: func.complexity,
            halsteadDifficulty: func.halstead.difficulty,
            halsteadEffort: func.halstead.effort,
            linesOfCode: func.loc
        }));
        return {
            functions,
            averageCyclomatic: analysis.complexity.cyclomatic,
            averageHalsteadEffort: analysis.complexity.halstead_effort,
            fileComplexity: analysis.maintainability
        };
    }
    getFileComplexity(document) {
        const report = this.analyzeDocument(document);
        return report.fileComplexity;
    }
    getFunctionAtPosition(document, position) {
        const report = this.analyzeDocument(document);
        return report.functions.find(func => func.line === position.line + 1);
    }
    generateReport() {
        // Implementation for generating a full project report
        this.outputChannel.show();
        this.outputChannel.appendLine('Generating complexity report...');
    }
    createEmptyReport() {
        return {
            functions: [],
            averageCyclomatic: 0,
            averageHalsteadEffort: 0,
            fileComplexity: 0
        };
    }
}
exports.ComplexityAnalyzer = ComplexityAnalyzer;
