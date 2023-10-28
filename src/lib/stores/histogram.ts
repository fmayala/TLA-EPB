import { writable, type Writable } from 'svelte/store';

const histogram: Writable<any> = writable({
    message: '',
    data: {
        buckets: [],
    } 
} ); // initialize with null or some default value

export default histogram;

