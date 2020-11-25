#!/bin/bash
BRANCH="master"


if [ "$1" = "$BRANCH" ]; then
    echo "Branch verified. Proceed to next step"
else
    exit 1
fi

