
import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js';

/*

the intent here is to wrap github api, as needed, with git calls

*/


const calls = {
	//https://github.com/isomorphic-git/isomorphic-git/blob/7ecb8819d0ceb9d6cf7284dd5538155d915eb7dd/src/api/getRemoteInfo.js
	'/info/refs?service=git-upload-pack': {}
}

/*
'/info/refs?service=git-upload-pack'

001e# service=git-upload-pack
000001540249ed222ca316883a46d5d96a7cb49f82613672 HEADmulti_ack thin-pack side-band side-band-64k ofs-delta shallow deepen-since deepen-not deepen-relative no-progress include-tag multi_ack_detailed allow-tip-sha1-in-want allow-reachable-sha1-in-want no-done symref=HEAD:refs/heads/main filter object-format=sha1 agent=git/github-g2f17bdd9039f
0045b4932b6cb2689433b9c5b96c364c99dcb752c2da refs/heads/backup-notes
0049d28395e908533f7aad699995095b046ebae3425e refs/heads/backup-templates
003d0249ed222ca316883a46d5d96a7cb49f82613672 refs/heads/main
003f80abbaa928c99f8c2278eda493362beae0ee3530 refs/heads/master
0045c5ab32da3f1db8b539315c5de9adb1809b539baa refs/heads/test-commits
003e1f6ef506feb5ca472627866d7a69e68a6104861b refs/pull/1/head
003f1a807e78e74965f9f244722aa82e3db2e9970a41 refs/pull/10/head
003ff6a79c19374e53b41381077b77972d207c282ccc refs/pull/11/head
003f770b1f51e255c67d4e807e685939f140c82fa3a0 refs/pull/12/head
003fbeb5483e8275108aad357bf632788ed221a8e9b5 refs/pull/13/head
003fcc9159f86c2292abd5b32e257ba5493917235eca refs/pull/14/head
003f5250c231637b54183fd5e04f73e29605ae6fd133 refs/pull/15/head
003f41452bc3fdbebc399b186bdef2f24700fec3774d refs/pull/16/head
003fcaf087a54d6a551b784a24ca31eed7310e080b1b refs/pull/17/head
003f95cd29c94480dadaf4b14e23a394ad979a397a9e refs/pull/18/head
003ff7c7215a9b92527812990baa6f59c926c79af4b1 refs/pull/19/head
003e2da39364f9fc7627b41ce7e84cd39dfc19a51e92 refs/pull/2/head
003fc5ab32da3f1db8b539315c5de9adb1809b539baa refs/pull/20/head
003f48f4d2df577d4bb0b84b104c2e53338be19e4e42 refs/pull/21/head
003f3e5c537314055ead3d818118f60501796ce7f95b refs/pull/22/head
003e7a0ec7314ea699aa1c767fca6a38601e18718cf7 refs/pull/3/head
003e3a3e9128dfa783152aae54db6ef805ec2a4f855d refs/pull/4/head
003e26afe2e4736cd1dd8cfdc1d50fed93d8ff8bcd56 refs/pull/5/head
003e511016fd4421010aef1f860c00fd3758198e73ea refs/pull/6/head
003ec1b3241750fc4e7a6bc658f4230c75a87aa9d09e refs/pull/7/head
003e5c3b831e405cbd3c6c239b038066a3a1370e1cec refs/pull/8/head
003ed572acef2436f1198a225b442c4818865e84cc60 refs/pull/9/head
003dd3ad539883283931306255972bbfbebee9299e31 refs/tags/0.4.3
003e69ff8ccbaca70b6343c9e9233b68984afec553db refs/tags/v0.4.0
00411f6ef506feb5ca472627866d7a69e68a6104861b refs/tags/v0.4.0^{}
003ed1721f011922bae94087f0c5720df8fe51e06f38 refs/tags/v0.4.1
003e694dcfbe73e2c29c8c6c6e7f86cfe23010841612 refs/tags/v0.4.2
0000
*/


const request = (...args) => {
	//console.log(JSON.stringify(args[0], null, 2));
	return http.request(...args);
}

export default { request };
