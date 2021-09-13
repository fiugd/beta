//const cacheName = "v0.4.4-2021-09-13T22:40:52.954Z";


const semVer = `([0-9]+(\.[0-9]+)+)`;
const iso8601Date = `[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?`;
const semVerDateRegex = new RegExp(`v${semVer}-${iso8601Date}\$`);
const getCacheName = async () => {
	const allCaches = await caches.keys();
	const allVersioned = allCaches
		.filter(x => semVerDateRegex.exec(x))
	return allVersioned.sort().reverse()[0];
};
const cacheName = await getCacheName();

const cache = await caches.open(cacheName);
const keys = await cache.keys();

console.log(JSON.stringify(keys.map(x => x.url)))
