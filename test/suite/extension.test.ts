import * as assert from 'assert';
import * as vscode from 'vscode';
import { after } from 'mocha';
import { ComplexityAnalyzer } from '../../src/complexityAnalyzer';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });

    test('ComplexityAnalyzer - JavaScript Analysis', async () => {
        const analyzer = new ComplexityAnalyzer({
            appendLine: () => {},
            show: () => {}
        } as unknown as vscode.OutputChannel);

        const jsCode = `
            function sum(a, b) {
                return a + b;
            }
            
            function complex(x) {
                if (x > 10) {
                    return x * 2;
                } else if (x < 5) {
                    return x / 2;
                } else {
                    return x;
                }
            }
        `;

        const doc = await vscode.workspace.openTextDocument({
            content: jsCode,
            language: 'javascript'
        });

        const report = analyzer.analyzeDocument(doc);
        
        assert.strictEqual(report.functions.length, 2);
        assert.strictEqual(report.functions[0].name, 'sum');
        assert.strictEqual(report.functions[0].cyclomatic, 1);
        assert.strictEqual(report.functions[1].name, 'complex');
        assert.strictEqual(report.functions[1].cyclomatic, 3);
    });

    test('ComplexityAnalyzer - Python Analysis', async () => {
        const analyzer = new ComplexityAnalyzer({
            appendLine: () => {},
            show: () => {}
        } as unknown as vscode.OutputChannel);

        const pythonCode = `
            def simple(a, b):
                return a + b
                
            def complex(x):
                if x > 10:
                    return x * 2
                elif x < 5:
                    return x / 2
                else:
                    return x
        `;

        const doc = await vscode.workspace.openTextDocument({
            content: pythonCode,
            language: 'python'
        });

        const report = analyzer.analyzeDocument(doc);
        
        assert.strictEqual(report.functions.length, 2);
        assert.strictEqual(report.functions[0].name, 'simple');
        assert.strictEqual(report.functions[1].name, 'complex');
        assert.ok(report.functions[1].cyclomatic > 1);
    });

    after(() => {
        vscode.window.showInformationMessage('All tests done!');
    });
});