#!/bin/bash

# Change directory
cd /app/execution

# Compile C++ code
g++ main.cpp -o main

for i in $( seq 1 $TEST_COUNT )
do
  ./main "tests/input${i}.txt" "tests/output${i}.txt"
done