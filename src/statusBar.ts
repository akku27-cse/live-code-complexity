import * as vscode from 'vscode';

export class StatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'complexity.showReport';
        this.statusBarItem.tooltip = 'Show code complexity report';
        this.statusBarItem.show();
    }

    public update(complexityScore: number): void {
        let icon = '🟢';
        if (complexityScore > 70) {
            icon = '🔴';
        } else if (complexityScore > 40) {
            icon = '🟡';
        }

        this.statusBarItem.text = `${icon} Complexity: ${complexityScore.toFixed(1)}`;
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}