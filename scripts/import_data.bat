@echo off
setlocal

REM Define variables
set "dockerContainer=tla-epb-timescaledb-1"
set "dbUser=epb"
set "dbName=xfmrdb"

REM Make sure you change the docker container name to match the name of your container as well as the database name and user

REM Iterate over each CSV file in the directory
for %%f in (.\imports_measure\*.csv) do (
    echo Processing file: %%f
    docker exec -i %dockerContainer% psql -U %dbUser% -d %dbName% -c "\COPY \"XfmrMeasure\"(\"MEASURE_DATE\", \"UTC_TIME\", \"XFMR_SID\", \"SINGLE_PHASE\", \"POLY_PHASE\", \"SINGLE_PHASE_IN_LOAD\", \"POLY_PHASE_IN_LOAD\", \"KW_MEASURE\", \"KVA_MEASURE\") FROM '/imports_measure/%%~nxf' WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '\"', ESCAPE '\"')"
)

echo Done
endlocal
