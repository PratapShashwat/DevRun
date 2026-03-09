# ⚙️ StackStore: Virtualization Engine (`engine`)

## Overview
This is the core execution layer of StackStore. Built entirely in C++, it is a headless, high-performance binary that parses `StackSpec` JSON blueprints and utilizes native Linux kernel features to create zero-cost, isolated development environments.

## How It Works
Instead of relying on heavy Virtual Machines or Docker daemons, this engine executes raw Linux `clone()` system calls to isolate the host OS:
* `CLONE_NEWPID`: Creates an isolated Process ID namespace.
* `CLONE_NEWNS`: Creates an isolated Mount namespace (chroot-style jail).
* `CLONE_NEWUTS`: Creates an isolated Hostname namespace.

## Compilation & Execution
**Note:** Because this engine interacts directly with the Linux Kernel to create namespaces, it *must* be compiled and run on a native Linux OS (e.g., Ubuntu). It will not run natively on Windows.

\`\`\`bash
# Compile the C++ binary
make

# Execute against a generated StackSpec JSON blueprint (requires sudo for namespaces)
sudo ./stackstore-engine ../environments/your_blueprint_spec.json
\`\`\`