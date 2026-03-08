#include <iostream>
#include <fstream>
#include <string>
#include <nlohmann/json.hpp>
#include <sched.h>
#include <sys/wait.h>
#include <unistd.h>
#include <filesystem>   // Modern C++ filesystem handling

using json = nlohmann::json;
using namespace std;
namespace fs = std::filesystem;

struct ContainerConfig {
    string projectName;
    string rootFsPath;
    string startCommand;
};

// ---------------------------------------------------------
// INSIDE THE ISOLATED CONTAINER
// ---------------------------------------------------------
int containerMain(void* arg) {
    ContainerConfig* config = (ContainerConfig*)arg;

    cout << "\n[CONTAINER] --- Booting inside Isolated Environment ---" << endl;

    // 1. Isolate UTS: Change the hostname (and check for errors!)
    if (sethostname(config->projectName.c_str(), config->projectName.length()) != 0) {
        cerr << "[CONTAINER-WARNING] Failed to set hostname." << endl;
    } else {
        cout << "[CONTAINER] Container Hostname set to: " << config->projectName << endl;
    }

    // 2. Safely create all parent directories (like mkdir -p)
    error_code ec;
    fs::create_directories(config->rootFsPath, ec);
    if (ec) {
        cerr << "[CONTAINER-ERROR] Failed to create directory: " << ec.message() << endl;
        return 1;
    }

    // 3. Lock into the new isolated filesystem
    if (chdir(config->rootFsPath.c_str()) != 0) {
        cerr << "[CONTAINER-ERROR] Failed to lock working directory to " << config->rootFsPath << endl;
        return 1;
    }
    
    cout << "[CONTAINER] Working directory locked to: " << config->rootFsPath << endl;

    // 4. Execute the AI's start command
    cout << "[CONTAINER] Executing command: " << config->startCommand << "\n" << endl;
    int result = system(config->startCommand.c_str());

    cout << "\n[CONTAINER] --- Process Finished with code " << result << " ---" << endl;
    return 0;
}

// ---------------------------------------------------------
// MAIN ENGINE (Runs on the Host OS)
// ---------------------------------------------------------
int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "[ERROR] Usage: ./stackstore-engine <path_to_spec.json>" << endl;
        return 1;
    }

    string configPath = argv[1];
    cout << "[ENGINE] Booting StackStore OS Virtualization Engine..." << endl;
    
    ifstream configFile(configPath);
    if (!configFile.is_open()) {
        cerr << "[ERROR] Failed to open blueprint file!" << endl;
        return 1;
    }

    json spec;
    try {
        configFile >> spec;
    } catch (json::parse_error& e) {
        cerr << "[ERROR] JSON Parsing failed: " << e.what() << endl;
        return 1;
    }

    string projectName = spec.value("project_name", "unnamed_project");
    string rootFsPath = spec.value("root_fs", "/tmp/stackstore/" + projectName);
    
    auto mainService = spec["services"][0];
    string startCommand = mainService.value("start", "echo 'No start command found'");

    cout << "[ENGINE] Blueprint loaded for: " << projectName << endl;
    cout << "[ENGINE] Allocating 1MB stack memory for isolated container..." << endl;
    
    const int STACK_SIZE = 1024 * 1024;
    char* stack = new char[STACK_SIZE];
    char* stackTop = stack + STACK_SIZE;

    ContainerConfig config = {projectName, rootFsPath, startCommand};

    cout << "[ENGINE] Firing clone() system call to create Namespaces..." << endl;

    pid_t child_pid = clone(containerMain, stackTop, CLONE_NEWUTS | CLONE_NEWPID | CLONE_NEWNS | SIGCHLD, &config);

    if (child_pid == -1) {
        cerr << "[ERROR] Failed to clone process! Are you running as root (sudo)?" << endl;
        return 1;
    }

    cout << "[ENGINE] Container process running with PID: " << child_pid << endl;
    waitpid(child_pid, nullptr, 0);

    cout << "[ENGINE] Container shut down safely. Memory freed." << endl;
    delete[] stack;

    return 0;
}