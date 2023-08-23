#include <bits/stdc++.h>
#include "solver.h"

using namespace std;

int twoNumberSum(int a, int b);

int main(int argc, char* argv[]) {
    ifstream input_file(argv[1]);
    ifstream helper_file(argv[2]);
    ofstream result_file(argv[3], ios::app);

    int a, b, c;
    input_file >> a >> b;
    helper_file >> c;

    Solver solver;
    int user_result = solver.twoNumberSum(a, b);

    if (c == user_result) {
        result_file << "ACCEPTED\n";
    } else {
        result_file << "FAILED\n";
    }
	return 0;
}
