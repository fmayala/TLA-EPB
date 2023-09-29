import { writable, type Writable } from "svelte/store";

export const sid: Writable<number> = writable(0);