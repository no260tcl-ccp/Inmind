#!/bin/sh
exec http-server dist -p ${PORT:-8080} -c-1
