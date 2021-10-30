//https://terser.org/docs/api-reference.html

const minified = {
	module: true,
	format: {
		comments: 'some',
		// max_line_len: 80
	},
	mangle: true,
	compress: false,
	// sourceMap: {
	// 	filename: "service-worker.js",
	// 	url: "inline"
	// }
};

const unmin = {
	module: true,
	format: {
		comments: 'all',
		beautify: true,
		// max_line_len: 80
	},
	mangle: false,
	compress: false,
};

export default function(){
	return minified;
	//return unmin;
}

