#!/bin/bash
# Initialize conda/mamba
eval "$(~/miniconda3/bin/conda shell.bash hook)"
eval "$(mamba shell hook --shell bash)"
export PATH="$HOME/.bun/bin:$PATH"
# Use mamba run to execute in the server environment
mamba run -n server python app.py
