#!/bin/bash

act --secret-file ".secrets" --var-file ".env" -W .github/workflows/helix-algolia-sync.yaml -e .github/actions/helix-algolia-sync-ts/samples/publish-event.json
