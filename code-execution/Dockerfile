# Lightweight linux distro
FROM alpine:3.14

WORKDIR /app

# Install the necessary apps that we would need for running apps
RUN apk update \
	&& apk add bash \
	&& apk add g++ # Compiler for c++

COPY entrypoint.sh .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

COPY execution/execute.sh ./execution/

ENTRYPOINT ["/app/entrypoint.sh"]
