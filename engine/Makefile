# Compiler settings
CXX = g++
CXXFLAGS = -std=c++17 -Wall -O2

# Target executable name
TARGET = stackstore-engine

# Build the executable
all: $(TARGET)

$(TARGET): main.cpp
	$(CXX) $(CXXFLAGS) -o $(TARGET) main.cpp

# Clean up compiled files
clean:
	rm -f $(TARGET)