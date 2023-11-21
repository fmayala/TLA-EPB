#!/bin/bash



# Define variables
hostDirectory="../imports_measure"  # Absolute path on the host
containerDirectory="../imports_measure"      # Path where the directory is mounted in the container
dockerContainer="tla-epb-timescaledb-1"
dbUser="epb"
dbName="xfmrdb"

# Ensure the host directory is mounted to the container at containerDirectory

# ...
# Iterate over each CSV file in the directory

for file in "$hostDirectory"/*.csv; do
    echo "Processing file: $file"
    docker exec -i "$dockerContainer" psql -U "$dbUser" -d "$dbName" -c "\COPY \"XfmrMeasure\"(\"MEASURE_DATE\", \"UTC_TIME\", \"XFMR_SID\", \"SINGLE_PHASE\", \"POLY_PHASE\", \"SINGLE_PHASE_IN_LOAD\", \"POLY_PHASE_IN_LOAD\", \"KW_MEASURE\", \"KVA_MEASURE\") FROM '${containerDirectory}/$(basename "$file")' WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '\"', ESCAPE '\"')"
done

echo "Done"

