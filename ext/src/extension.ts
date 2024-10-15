import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import createTypeTree from "./create-type-tree";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, "type-tree" is now active!');

  function getActiveFilePath(): string {
    const activeEditor = vscode.window.activeTextEditor;

    const filePath = activeEditor?.document.uri.fsPath;
    return filePath ?? "Target file path not found";
  }

  async function getTsConfigPath() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;

      const tsConfigPath = path.join(workspaceRoot, "tsconfig.json");

      if (fs.existsSync(tsConfigPath)) {
        return tsConfigPath;
      }
    }
  }

  function getWebviewContent(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    typeTree: string
  ): string {
    const scriptUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, "media", "renderjson.js")
    );

    return `
      <div id="test"></div>
      <script type="text/javascript" src="${scriptUri}"></script>
      <script>
          document.getElementById("test").appendChild(
              renderjson(${typeTree})
          );
      </script>
      <style>
      .renderjson a              { text-decoration: none; }
      .renderjson .disclosure    { color: crimson;
                                  font-size: 150%; }
      .renderjson .syntax        { color: grey; }
      .renderjson .string        { color: red; }
      .renderjson .number        { color: cyan; }
      .renderjson .boolean       { color: plum; }
      .renderjson .key           { color: lightblue; }
      .renderjson .keyword       { color: lightgoldenrodyellow; }
      .renderjson .object.syntax { color: lightseagreen; }
      .renderjson .array.syntax  { color: lightsalmon; }
      }
      </style>
      `;
  }

  function showPrettyJson(
    panel: vscode.WebviewPanel,
    jsonContent: any,
    context: vscode.ExtensionContext
  ) {
    panel.webview.html = getWebviewContent(panel, context, jsonContent);
  }

  function showFileMessage(path?: string) {
    if (path) {
      vscode.window.showInformationMessage(
        `${path.split("/")?.at(-1)} was added`
      );
    } else {
      vscode.window.showInformationMessage(
        `File not found. Please check that tsconfig is present and a ts file is open`
      );
    }
  }

  const disposable = vscode.commands.registerCommand(
    "type-tree.create",
    async () => {
      const filePath = getActiveFilePath();
      showFileMessage(filePath);

      const configFile = await getTsConfigPath().then((file) => file);
      showFileMessage(configFile);

      const typeTree = createTypeTree(filePath, undefined, configFile);

      const panel = vscode.window.createWebviewPanel(
        "jsonViewer", // Identifies the type of the webview panel
        "JSON Viewer", // Title of the panel
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {
          enableScripts: true, // Enable scripts in the webview
        }
      );

      // Display the type tree in the webview
      showPrettyJson(panel, JSON.stringify(typeTree), context);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
