#!/bin/bash

# Define variables
directory="..\imports_measure"
dockerContainer="tla-epb-timescaledb-1"
dbUser="epb"
dbName="xfmrdb"

# Iterate over each CSV file in the directory
for file in "$directory"/*.csv; do
    echo "Processing file: $file"
    docker exec -i "$dockerContainer" psql -U "$dbUser" -d "$dbName" -c "\COPY \"XfmrMeasure\"(\"MEASURE_DATE\", \"UTC_TIME\", \"XFMR_SID\", \"SINGLE_PHASE\", \"POLY_PHASE\", \"SINGLE_PHASE_IN_LOAD\", \"POLY_PHASE_IN_LOAD\", \"KW_MEASURE\", \"KVA_MEASURE\") FROM '/${directory}/$(basename "$file")' WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '\"', ESCAPE '\"')"
done

echo "Done"
