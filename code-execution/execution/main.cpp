#include <iostream>
#include <fstream>
#include "solver.h"

using namespace std;

int twoNumberSum(int a, int b);

int main(int argc, char* argv[]) {
    ifstream input_file(argv[1]);
    ifstream output_file(argv[2]);

    int a, b, c;
    input_file >> a >> b;
    output_file >> c;

    Solver solver;
    int user_result = solver.twoNumberSum(a, b);

    cout << "Expected: " << c << '\n';
    cout << "Got: " << user_result << '\n';

	return 0;
}
