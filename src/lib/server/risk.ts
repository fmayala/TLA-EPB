export type Measure = {
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
};

export type DriverProfile = {
	ID: number;
	NAME: string;
	MILES_DRIVEN: number;
	KWH_EXPENDITURE: number;
	TIME_INTERVAL: number;
};

export enum TimeInterval {
	EARLY_MORNING = 0, // 12am - 6am
	MORNING = 1, // 6am - 12pm
	AFTERNOON = 2, // 12pm - 6pm
	EVENING = 3 // 6pm - 12am
}

export function convertNormalToEvUsage(
	measures: Measure[],
	ev_count: number,
	driver_profiles: DriverProfile[],
	profileCounts: {}
): Promise<Measure[]> {
	return new Promise((resolve, reject) => {
		if (ev_count === 0) {
			resolve([]);
			return;
		}

		// Initialize the resulting array with the original measures
		let new_usage_measures: Measure[] = [...measures];

		driver_profiles.forEach((driver_profile) => {
			const evsForProfile = profileCounts[driver_profile.ID] || 0;
			if (evsForProfile === 0) return;

			// Calculate total kWh consumed
			const total_kwh = driver_profile.MILES_DRIVEN * driver_profile.KWH_EXPENDITURE;

			// Calculate charging time (in hours)
			const charging_time = total_kwh / 7.5;

			// Calculate intervals we need in 15-minute increments
			const intervals = Math.ceil(charging_time * 4);

			// Define time range for each interval
			const startHour = driver_profile.TIME_INTERVAL * 6;
			const endHour = startHour + 6;

			new_usage_measures = new_usage_measures.map((measure) => {
				const measureHour = new Date(measure.UTC_TIME).getUTCHours();

				// Check if the measure is within the specified time range
				if (measureHour >= startHour && measureHour < endHour) {
					// Check if we are within the number of intervals to modify
					const withinIntervals =
						(measureHour * 4 + Math.floor(new Date(measure.UTC_TIME).getUTCMinutes() / 15)) % 24 <
						intervals;
					if (withinIntervals) {
						const added_kVA = (7.5 / 0.9) * evsForProfile; // additional kVA for each EV, considering power factor of 0.9
						const new_KVA = (Number(measure.KVA_MEASURE) || 0) + added_kVA;

						return { ...measure, KVA_MEASURE: new_KVA, KW_MEASURE: new_KVA * 0.9 };
					}
				}

				// If the measure is not modified, return the original measure
				return measure;
			});
		});

		resolve(new_usage_measures);
	});
}

export function ev_usage_measures(
  measures: Measure[],
  ev_count: number,
  driver_profiles: DriverProfile[],
  profileCounts: {}
): Promise<[number, number][]> {
  return new Promise((resolve, reject) => {
      if (ev_count === 0) {
          resolve([]);
          return;
      }

      // Initialize the resulting array with the original measures
      let new_usage_measures: [number, number][] = measures.map(measure => {
          const time = new Date(measure.UTC_TIME).getTime();
          return [time, measure.KVA_MEASURE || 0];
      });

      driver_profiles.forEach(driver_profile => {
          const evsForProfile = profileCounts[driver_profile.ID] || 0;
          if (evsForProfile === 0) return;

          // Calculate total kWh consumed
          const total_kwh = driver_profile.MILES_DRIVEN * driver_profile.KWH_EXPENDITURE;

          // Calculate charging time (in hours)
          const charging_time = total_kwh / 7.5;

          // Calculate intervals we need in 15-minute increments
          const intervals = Math.ceil(charging_time * 4);

          // Define time range for each interval
          const startHour = driver_profile.TIME_INTERVAL * 6;
          const endHour = startHour + 6;

          new_usage_measures = new_usage_measures.map(([time, kVA]) => {
              const measureHour = new Date(time).getUTCHours();

              // Check if the measure is within the specified time range
              if (measureHour >= startHour && measureHour < endHour) {
                  // Check if we are within the number of intervals to modify
                  const withinIntervals = (measureHour * 4 + Math.floor(new Date(time).getUTCMinutes() / 15)) % 24 < intervals;
                  if (withinIntervals) {
                      const added_kVA = (7.5 / 0.9) * evsForProfile; // additional kVA for each EV, considering power factor of 0.9
                      const new_KVA = kVA + added_kVA;

                      return [time, new_KVA];
                  }
              }

              // If the measure is not modified, return the original measure
              return [time, kVA];
          });
      });

      resolve(new_usage_measures);
  });
}

export function overloaded_time(measures: Measure[], KVA_RATING: number): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			// All measures above the kva rating
			const measures_above_kva_rating = measures.filter(
				(row) => row.KVA_MEASURE !== null && row.KVA_MEASURE > KVA_RATING
			);

			// Summation of all measures above the kva rating
			const sum_measures_above_kva_rating = measures_above_kva_rating.reduce(
				(a, b) => a + (b.KVA_MEASURE || 0),
				0
			);

			// Total overloaded hours
			const overloaded_time = sum_measures_above_kva_rating * 0.25;

			resolve(overloaded_time.toFixed(2));
		} catch (error) {
			reject(error);
		}
	});
}

export function overloaded_kwh(measures: Measure[], KVA_RATING: number): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			// All measures above the kva rating
			const measures_above_kva_rating = measures.filter(
				(row) => row.KVA_MEASURE !== null && row.KVA_MEASURE > KVA_RATING
			);

			const overloaded_kwh = measures_above_kva_rating.map(
				(row) => (row.KVA_MEASURE || 0) - KVA_RATING * 0.25
			);

			const total_overloaded_kwh = overloaded_kwh.reduce((a, b) => a + b, 0);

			resolve(total_overloaded_kwh.toFixed(2));
		} catch (error) {
			reject(error);
		}
	});
}

export function total_kwh_above_threshold(
	measures: Measure[],
	KVA_RATING: number,
	threshold: number
): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			// All measures above the kva rating
			// Add a property to each measure for the load percentage
			const measures_with_load_percentage = measures.map((row) => {
				return {
					...row,
					LOAD_PERCENT: ((row.KVA_MEASURE || 0) / KVA_RATING) * 100
				};
			});

			// Find measures above the threshold
			const measures_above_threshold = measures_with_load_percentage.filter(
				(row) => row.LOAD_PERCENT > threshold
			);

			// Measures above the threshold in kwh
			const measures_above_threshold_kwh = measures_above_threshold.map(
				(row) => ((row.KVA_MEASURE || 0) - KVA_RATING * (threshold / 100)) * 0.25
			);

			// Summation of all measures above the threshold in kwh
			const total_overloaded_kwh = measures_above_threshold_kwh
				.reduce((a, b) => a + b, 0)
				.toFixed(2);

			resolve(total_overloaded_kwh);
		} catch (error) {
			reject(error);
		}
	});
}

export function get_upgrade_threshold(KVA_RATING: number): number {
	return 1.5 * KVA_RATING * 876 * 2;
}

export function total_available_kwh(measures: Measure[], KVA_RATING: number): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			// All measures below the kva rating
			const measures_below_kva_rating = measures.filter(
				(row) => row.KVA_MEASURE !== null && row.KVA_MEASURE < KVA_RATING
			);

			// Available kwh
			const available_kwh = measures_below_kva_rating.map(
				(row) => (KVA_RATING - (row.KVA_MEASURE || 0)) * 0.25
			);

			// Summation of all available kwh
			const total_available_kwh = available_kwh.reduce((a, b) => a + b, 0);

			resolve(total_available_kwh.toFixed(2));
		} catch (error) {
			reject(error);
		}
	});
}
