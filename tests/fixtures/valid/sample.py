#!/usr/bin/env python3
"""
Sample Python file for testing file content reading.
"""

def greet(name: str) -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"

def main():
    """Main function."""
    users = ['Alice', 'Bob', 'Charlie']
    for user in users:
        print(greet(user))

if __name__ == '__main__':
    main()