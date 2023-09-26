export type GenerateResponse = {
    message: string;
    data: GeneratedData;
}

export type GeneratedData = {
    total_kwh_above_threshold: number;
    total_overloaded_hours: number;
    total_overloaded_kwh: number;
    upgrade_threshold: number;
    total_available_kwh: number;
    xfmr_sid: number;
    measures: [];
    max: number;
}