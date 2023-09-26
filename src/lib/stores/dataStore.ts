import type { GeneratedData, GenerateResponse } from '$lib/server/response';
import { writable, type Writable } from 'svelte/store';

const dataStore: Writable<GenerateResponse> = writable({
    message: '',
    data: {
        total_kwh_above_threshold: 0,
        total_overloaded_hours: 0,
        total_overloaded_kwh: 0,
        upgrade_threshold: 0,
        total_available_kwh: 0,
        xfmr_sid: 0,
        measures: [],
        max: 0
    } as GeneratedData
} as GenerateResponse); // initialize with null or some default value

export default dataStore;
