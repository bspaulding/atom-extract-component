'use babel';

function warnAboutUnextractableImport(importName, isVar = false) {
	const detail = [
		`Couldn't find an import for component '${importName}'.`
	];
	if (isVar) {
		detail.push("Looks like its declared in this file?")
	}
	atom.notifications.addWarning("Manual Import Required", {
		dismissable: true,
		detail: detail.join("\n")
	})
}

export function parse(code) {
	var babylon = require("babylon");
	return babylon.parse(code, {
		sourceType: "module",
		plugins: ["jsx"]
	});
}

export function getPropNames(node) {
	var babel = require("babel-core");
	let vars = [];
	babel.traverse(node, {
		MemberExpression: function(nodePath) {
			const name = nodePath.node.object.name;
			if (vars.indexOf(name) < 0) {
				vars.push(name);
			}
		}
	});
	return vars;
}

function isUpperCase(s) {
	return s.toUpperCase() === s;
}

export function getImports(node, fileNode) {
	var babel = require("babel-core");
	var imports = [];
	babel.traverse(node, {
		JSXElement: function(nodePath) {
			const name = nodePath.node.openingElement.name.name;
			if (imports.indexOf(name) < 0 && isUpperCase(name[0])) {
				console.log(`[JSXElement] ${name}`);
				imports.push(name);
			}
		}
	});
	var sourcesByImport = {};
	var importsBySource = {};
	var sources = [];
	var importsAsVars = [];
	babel.traverse(fileNode, {
		ImportDeclaration: function(nodePath) {
			imports
				// get the imports w/o sources
				.filter(i => !sourcesByImport[i])
				// for each, see if this import is the source
				.forEach(i => {
					const specifier = nodePath.node.specifiers
						.find(s => s.local.name === i)
					if (specifier) {
						const source = nodePath.node.source.value;
						sourcesByImport[i] = source;
						if (!importsBySource[source]) {
							importsBySource[source] = [];
							sources.push(source);
						}
						importsBySource[source].push(i);
					}
				})
		},
		VariableDeclarator: function(nodePath) {
			const name = nodePath.node.id.name;
			if (imports.indexOf(name) >= 0) {
				importsAsVars.push(name);
			}
		}
	});
	imports
		.filter(i => !sourcesByImport[i])
		.forEach(i => warnAboutUnextractableImport(i, importsAsVars.indexOf(i) >= 0))
	return { importsBySource, sources };
}
