export type GenerateResponse = {
    message: string;
    data: GeneratedData;
}

export type NormalData = {
    total_kwh_above_threshold: string;
    total_overloaded_hours: string;
    total_overloaded_kwh: string;
    upgrade_threshold: number;
    total_available_kwh: string;
}

export type EvUsage = {
    total_kwh_above_threshold: string;
    total_overloaded_hours: string;
    total_overloaded_kwh: string;
    upgrade_threshold: number;
    total_available_kwh: string;
}

export type GeneratedData = {
    normal: NormalData;
    ev_usage: EvUsage;
    xfmr_sid: number;
    measures: [];
    driver_measures: [];
    max: number;
    real_threshold: number;
}