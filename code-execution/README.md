# Code execution environment
Currently it's demo version that only compiles and runs c++ program that sums 2 numbers

# Build 
```bash
docker rmi -f macscode/cpp-docker
docker build -t macscode/cpp-docker .
```

# Clean
Run this command before Running container (not necessary)
```bash
docker-compose down
```

# Run
```bash
docker-compose up -d
```

# Check logs
```bash
docker logs cpp_execution_environment
```