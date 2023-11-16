#!/bin/bash

# Define variables
dockerContainer="tla-epb-timescaledb-1"
dbUser="epb"
dbName="xfmrdb"
fileName="XfmrDimension.csv"

# Run the Docker command
docker exec -i "$dockerContainer" psql -U "$dbUser" -d "$dbName" -c "\COPY \"XfmrDimension\"(\"XFMR_SID\", \"EFFECTIVE_START_DATE\", \"EFFECTIVE_END_DATE\", \"UPDATE_DATE\", \"CURRENT_INDICATOR\", \"GIS_BANK_INDICATOR\", \"GIS_IDENTIFIER\", \"XFMR_NUMBER\", \"KVA_RATING\", \"PHASE\") FROM '/imports_xfmr/$fileName' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '\"');"

echo "Done"
