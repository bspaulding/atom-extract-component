'use babel';
import ExtractComponentView from "./extract-component-view";
import { CompositeDisposable } from "atom";
import babel from "babel-core";
import {
	parse,
	getPropNames,
	getImports
} from "./parse-helpers";

function expandImports(imports) {
	return imports.sources.map(source => (
		`import { ${imports.importsBySource[source].sort().join(", ")} } from "${source}";`
	)).join("\n");
}

function getFileDirectory(editor) {
	const segments = editor.buffer.file.path.split("/");
	return [segments.slice(0, segments.length - 1).join("/"), "/"].join("");
}

export default {

  extractComponentView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.extractComponentView = new ExtractComponentView(state.extractComponentViewState);
		this.extractComponentView.input.addEventListener("keyup", this.keyUp.bind(this));
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.extractComponentView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "extract-component:extract": () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.extractComponentView.destroy();
  },

  serialize() {
    return {
      extractComponentViewState: this.extractComponentView.serialize()
    };
  },

  toggle() {
		if (this.modalPanel.isVisible()) {
			this.modalPanel.hide()
		} else {
			this.extractComponentView.input.getModel().setText('');
			this.modalPanel.show();
			this.extractComponentView.focusInput();
		}
	},

	extractComponent(componentName) {
    const pane = atom.workspace.getActivePane();
    const activeEditor = pane.getActiveEditor();
    const editor = atom.workspace.buildTextEditor({
      grammar: activeEditor.getGrammar()
    });
		const code = activeEditor.getSelectedText();
		const node = parse(code);
		const imports = getImports(node, parse(activeEditor.getText()));
		const vars = getPropNames(node);
		const lines = code.split("\n");
		const indentSpace = lines[0].match(/^\s*/)[0];
		const indentSpaceRegExp = new RegExp(`^${indentSpace}`);
		const singleIndent = lines[1].replace(indentSpaceRegExp, "").match(/^\s*/)[0];
    editor.insertText(`import React from "react";
${expandImports(imports)}

export const ${componentName} = (${vars.length === 0 ? '' : `{ ${vars.join(', ')} }`}) => (
${code.split("\n").map(line => line.replace(indentSpaceRegExp, singleIndent)).join("\n")});`);
    pane.addItem(editor);
		editor.saveAs(`${getFileDirectory(activeEditor)}${componentName}.js`)
		activeEditor.insertText(`${indentSpace}<${componentName} ${vars.map(v => `${v}={${v}}`).join(' ')}/>\n`);
		const cursor = activeEditor.getCursorBufferPosition();
		activeEditor.moveToTop();
		activeEditor.insertNewlineAbove();
		activeEditor.insertText(`import { ${componentName} } from "./${componentName}";`);
		activeEditor.setCursorBufferPosition(cursor);
		pane.focus();
  },

	keyUp(event) {
		if (event.keyCode === 13) {
			this.toggle();
			// Note: event.target is an atom-text-editor, not an input[type="text"]
			this.extractComponent(event.currentTarget.getModel().getText());
		}
	}
};
