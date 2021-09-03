import LightningFS from 'https://cdn.skypack.dev/@isomorphic-git/lightning-fs';

// a file system must implement:

/*
	fs.promises.readFile(path[, options])
	fs.promises.writeFile(file, data[, options])
	fs.promises.unlink(path)
	fs.promises.readdir(path[, options])
	fs.promises.mkdir(path[, mode])
	fs.promises.rmdir(path)
	fs.promises.stat(path[, options])
	fs.promises.lstat(path[, options])
	fs.promises.readlink(path[, options]) (optional ¹)
	fs.promises.symlink(target, path[, type]) (optional ¹)
	fs.promises.chmod(path, mode) (optional ²)
*/

class FileSystem {
	constructor(opts={}){
		opts.fileDbName = opts.fileDbName || 'lightningFS';
		const storeName = opts.storeName || 'defaultStore';

		this.fs = new LightningFS(storeName, opts);
		this.log = [];
 
		const wrapSpy = (all, one) => {
			all[one] = (...args) => {
				this.log.push([one, args]);
				return this.fs.promises[one](...args);
			};
			return all;
		}
		this.promises = Object.keys(this.fs.promises)
			.reduce(wrapSpy, {});
	}
};

export default FileSystem;
