#!/bin/bash

# Change directory
cd /app/execution

# Compile C++ code
g++ main.cpp -o main

if [[ -d results ]];
then
  rm -r results/
fi
mkdir results

# Set up Time Limit
ulimit -t $TIME_LIMIT
TLE_STATUS=137 # ulimit exit code for tle

for i in $( seq 1 $TEST_COUNT )
do
  ./main "tests/input${i}.txt" "tests/output${i}.txt" ${i} "results/result.txt"
  exit_status=$?
  if [[ $exit_status = $TLE_STATUS ]]; then
      echo "TIME LIMIT EXCEEDED" >> results/result.txt
  fi
done