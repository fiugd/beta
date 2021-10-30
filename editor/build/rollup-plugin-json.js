const assertMatcher = new RegExp(' assert { type: "json" }', 'g');

function json(options={}) {

	return {
		name: 'json',

		transform(source, id) {
			if(source.includes(' assert { type: "json" }')){
				const stripAsserts = source.replace(assertMatcher,'');
				return stripAsserts;
			}
			if (id.slice(-5) !== '.json'){ return null; }
			return `/*!\n\tfrom ${id}\n*/\nexport default ${source}`;
		}
	}
}

export default json;
