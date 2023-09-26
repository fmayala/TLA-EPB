type Measure = {
    ID: number;
    MEASURE_DATE: Date;
    UTC_TIME: Date;
    XFMR_SID: bigint;
    SINGLE_PHASE: number | null;
    POLY_PHASE: number | null;
    SINGLE_PHASE_IN_LOAD: number | null;
    POLY_PHASE_IN_LOAD: number | null;
    KW_MEASURE: number | null;
    KVA_MEASURE: number | null;
}

export function overloaded_time(measures: Measure[], KVA_RATING: number): number {
    // All measures above the kva rating
    const measures_above_kva_rating = measures.filter(row => row.KVA_MEASURE !== null && row.KVA_MEASURE > KVA_RATING);
    
    // Summation of all measures above the kva rating
    const sum_measures_above_kva_rating = measures_above_kva_rating.reduce((a, b) => a + (b.KVA_MEASURE || 0), 0);

    // Total overloaded hours
    const overloaded_time = sum_measures_above_kva_rating * 0.25;

    return overloaded_time;
}

export function overloaded_kwh(measure: Measure[], KVA_RATING: number): number {
    // All measures above the kva rating
    const measures_above_kva_rating = measure.filter(row => row.KVA_MEASURE !== null && row.KVA_MEASURE > KVA_RATING);

    const overloaded_kwh = measures_above_kva_rating.map(row => (row.KVA_MEASURE || 0) - KVA_RATING * 0.25);

    const total_overloaded_kwh = overloaded_kwh.reduce((a, b) => a + b, 0);

    return total_overloaded_kwh;
}

export function total_kwh_above_threshold(measures: Measure[], KVA_RATING: number, threshold: number): number {
    // All measures above the kva rating
    // Add a property to each measure for the load percentage
    const measures_with_load_percentage = measures.map(row => {
        return {
            ...row,
            LOAD_PERCENT: (row.KVA_MEASURE || 0) / KVA_RATING * 100
        }
    });

    // Find measures above the threshold
    const measures_above_threshold = measures_with_load_percentage.filter(row => row.LOAD_PERCENT > threshold);

    // Measures above the threshold in kwh
    const measures_above_threshold_kwh = measures_above_threshold.map(row => ((row.KVA_MEASURE || 0) - (KVA_RATING * (threshold / 100))) * 0.25);

    // Summation of all measures above the threshold in kwh
    const total_overloaded_kwh = measures_above_threshold_kwh.reduce((a, b) => a + b, 0);

    return total_overloaded_kwh;
}

export function get_upgrade_threshold(KVA_RATING: number): number {
    return 1.5 * KVA_RATING * 876 * 2;
}

export function total_available_kwh(measures: Measure[], KVA_RATING: number): number {
    // All measures below the kva rating
    const measures_below_kva_rating = measures.filter(row => row.KVA_MEASURE !== null && row.KVA_MEASURE < KVA_RATING);

    // Available kwh
    const available_kwh = measures_below_kva_rating.map(row => (KVA_RATING - (row.KVA_MEASURE || 0)) * 0.25);

    // Summation of all available kwh
    const total_available_kwh = available_kwh.reduce((a, b) => a + b, 0);

    return total_available_kwh;
}