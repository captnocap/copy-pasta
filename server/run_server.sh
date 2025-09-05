#!/bin/bash
# Initialize conda/mamba - try multiple paths
if [ -f "$HOME/miniconda3/bin/conda" ]; then
    eval "$($HOME/miniconda3/bin/conda shell.bash hook)"
elif [ -f "/opt/homebrew/Caskroom/mambaforge/base/bin/conda" ]; then
    eval "$(/opt/homebrew/Caskroom/mambaforge/base/bin/conda shell.bash hook)"
fi

export PATH="$HOME/.bun/bin:$PATH"

# Use mamba run to execute in the server environment
mamba run -n server python app.py
