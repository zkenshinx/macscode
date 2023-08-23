#!/bin/bash

# Change directory
cd /app/execution

# Compile C++ code
g++ main.cpp -o main

if [[ ! -d results ]];
then
  mkdir results
fi

for i in $( seq 1 $TEST_COUNT )
do
  ./main "tests/input${i}.txt" "tests/output${i}.txt" "results/result.txt"
done