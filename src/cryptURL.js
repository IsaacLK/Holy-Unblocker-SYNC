// encrypting/decrypt parts of the URL
// particularly proxy,compat

import { decrypt as aes_decrypt, encrypt as aes_encrypt } from 'crypto-js/aes';
import utf8 from 'crypto-js/enc-utf8';

if (!('cryptURL key' in localStorage)) {
	localStorage['cryptURL key'] = Math.random().toString(36).slice(2);
}

const key = localStorage['cryptURL key'];

export function encryptURL(part) {
	return aes_encrypt(part, key).toString();
}

export function decryptURL(part) {
	return aes_decrypt(part, key).toString(utf8);
}
