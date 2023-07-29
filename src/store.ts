import { writable } from 'svelte/store';
import { AVE_DOWNLOADDIR_KEY } from './config'

export const showType = writable('home');

export const downloadDirPathStore = writable(window.localStorage.getItem(AVE_DOWNLOADDIR_KEY));