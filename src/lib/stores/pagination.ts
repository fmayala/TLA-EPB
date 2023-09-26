import { writable } from 'svelte/store';

const pageIndex = writable(1); // initialize with null or some default value

export default pageIndex;
