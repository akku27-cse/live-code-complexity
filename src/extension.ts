import * as vscode from 'vscode';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { ComplexityDecorator } from './decorator';
import { ComplexityHoverProvider } from './hoverProvider';
import { StatusBar } from './statusBar';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('Code Complexity');
    const statusBar = new StatusBar();
    const analyzer = new ComplexityAnalyzer(outputChannel);
    const decorator = new ComplexityDecorator(analyzer);
    const hoverProvider = new ComplexityHoverProvider(analyzer);

    // Register providers
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            [
                { language: 'javascript' },
                { language: 'typescript' },
                { language: 'python' },
                { language: 'java' }
            ],
            hoverProvider
        )
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('complexity.showReport', () => {
            analyzer.generateReport();
        })
    );

    // Handle document changes
    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor?.document === event.document) {
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

export function deactivate() {}