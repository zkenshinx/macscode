#!/bin/bash
# Entrypoint for docker container

cd execution

mkdir result

echo ${test_count} > result/test_count.txt

compile_error_tmp_file=$(mktemp)
g++ src/main.cpp -o src/main -std=c++11 2> "$compile_error_tmp_file"

# Check and write compile errors to every test result
if [ $? -ne 0 ]; then
  for test_num in $(seq 1 "${test_count}")
  do
    output_file=result/result_"${test_num}".txt
    echo "COMPILE_ERROR" > "$output_file"
    cat "$compile_error_tmp_file" >> "$output_file"
  done
  exit
fi

ulimit -t ${time_limit}

ulimit -v ${memory_limit}

for test_num in $(seq 1 "${test_count}")
do
  runtime_error_tmp_file=$(mktemp)
  src/main tests/in_"${test_num}".txt tests/out_"${test_num}".txt result/result_"${test_num}".txt \
      2> "$runtime_error_tmp_file"

  exit_code=$?

  echo ${exit_code}

  cat "$runtime_error_tmp_file"

  if [ -s "$runtime_error_tmp_file" ]; then
    echo "YES"
  fi

  if [[ ${exit_code} -eq 137 ]]; then
    echo "TLE" > result/result_"${test_num}".txt
  elif [[ ${exit_code} -eq 134 ]]; then
    echo "MLE" > result/result_"${test_num}".txt
  elif [[ ${exit_code} -ne 0 ]]; then
    output_file=result/result_"${test_num}".txt
    echo "RTE" > "$output_file"
    cat "$runtime_error_tmp_file" >> "$output_file"
  fi

done