import type { EvUsage, GeneratedData, GenerateResponse, NormalData } from '$lib/server/response';
import { writable, type Writable } from 'svelte/store';

const dataStore: Writable<any> = writable({
    message: '',
    data: {
        normal: {} as NormalData,
        ev_usage: {} as EvUsage,
        xfmr_sid: 0,
        measures: [],
        driver_measures: [],
        max: 0,
        real_threshold: 0,
        year: 0,
        evs: 0,
    } as GeneratedData
} as GenerateResponse); // initialize with null or some default value

export default dataStore;

