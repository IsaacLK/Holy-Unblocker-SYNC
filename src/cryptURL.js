// encrypting/decrypt parts of the URL
// particularly proxy,compat
import { decrypt as aesDecrypt, encrypt as aesEncrypt } from 'crypto-js/aes';
import utf8 from 'crypto-js/enc-utf8';

if (!('cryptURL key' in localStorage)) {
	localStorage['cryptURL key'] = Math.random().toString(36).slice(2);
}

const key = localStorage['cryptURL key'];

export function encryptURL(part) {
	return aesEncrypt(part, key).toString();
}

export function decryptURL(part) {
	return aesDecrypt(part, key).toString(utf8);
}
