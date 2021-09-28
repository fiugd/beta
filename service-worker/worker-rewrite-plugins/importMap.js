function importsPlugin() {
	return {
		visitor: {
			ImportDeclaration(path, state) {
				const { map } = state.opts;
				// if first char is a / then prepend self.location.origin
				// otherwise suss out? ../ or ./ etc?
				// "node" is doing this
				// keep in mind that we may want those modules to use SW worker transform
				if(map.imports[path.node.source.value]){
					path.node.source.value = map.imports[path.node.source.value]
					return;
				}
				if(path.node.source.value.startsWith('/')){
					path.node.source.value = `${self.location.origin}${path.node.source.value}`;
					return;
				}
				return;
			},
		},
	};
}

export default importsPlugin;
