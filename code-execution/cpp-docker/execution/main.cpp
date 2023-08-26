#include <bits/stdc++.h>
#include "solver.h"

using namespace std;

int twoNumberSum(int a, int b);

int main(int argc, char* argv[]) {
    ifstream input_file(argv[1]);
    ifstream helper_file(argv[2]);
    int test_number = stoi(argv[3]);
    ofstream result_file(argv[4], ios::app);

    int a, b, c;
    input_file >> a >> b;
    helper_file >> c;

    Solver solver;
    int user_result = solver.twoNumberSum(a, b);

    if (test_number == 2) {
        // Cause WA
        user_result += 1;
    }

    if (test_number == 3) {
        // Try to cause TLE
        int x = 5;
        while (true) {
            x += 1;
        }
        cout << x << endl;
    }

    if (c == user_result) {
        result_file << "ACCEPTED\n";
    } else {
        result_file << "FAILED\n";
    }
	return 0;
}
