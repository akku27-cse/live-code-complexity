# Live Code Complexity Visualizer

![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue)  
**Real-time code complexity analysis with Cyclomatic and Halstead metrics, refactoring suggestions, and visual feedback right inside Visual Studio Code.**

---

## 🔍 Features

- ✅ **Live Complexity Metrics**  
    Get real-time updates on Cyclomatic and Halstead complexity as you type.

- ✅ **Webview Dashboard**  
    Visual representation of complexity metrics in a user-friendly panel.

- ✅ **Refactoring Suggestions**  
    Automatically suggests code improvements when thresholds are exceeded.

- ✅ **Inline Decorations (coming soon)**  
    Highlight complex functions directly in the editor (planned feature).

---

## 📦 Installation

1. Open **Extensions** in VS Code (`Ctrl+Shift+X`).
2. Search for **Live Code Complexity Visualizer**.
3. Click **Install**.

Or install via CLI:

```bash
code --install-extension your-publisher.live-code-complexity-visualiser
```

---

## 🚀 Getting Started

1. Open any `.js` or `.ts` file in your workspace.
2. Run the command `Live Code Complexity: Open Metrics View` from the Command Palette (`Ctrl+Shift+P`).
3. View real-time metrics and get refactoring insights.

---

## ⚙️ Configuration

You can customize the extension behavior in your `settings.json`:

```json
{
    "liveCodeComplexityVisualiser.updateInterval": 500,
    "liveCodeComplexityVisualiser.showHalstead": true
}
```

---

## 🧠 Metrics Explained

- **Cyclomatic Complexity**: Measures the number of independent paths through your code.
- **Halstead Complexity**: Analyzes code based on operators, operands, and expressions to determine difficulty and effort.

---

## 📚 Roadmap

- Webview-based complexity panel.
- Inline diagnostics and highlighting.
- Support for additional languages (Python, Java, etc.).
- Export reports to Markdown/PDF.

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit PRs for any improvements or features.

---

## 📄 License

MIT © [Santu Jana]

---

Would you like to also include a sample screenshot or animated GIF showing the extension in action?