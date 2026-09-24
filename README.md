# AG CraftNode

AG CraftNode is a local Minecraft server manager for creating, configuring, and running server instances from a desktop app.

## Features
- Create and manage multiple local Minecraft servers
- Install and configure Java-based server versions
- Start, stop, and monitor server state
- Manage plugins, server config, and tunnel setup
- Use themed desktop UI and local asset branding

## Run locally

From the project root:

```bash
python main.py
```

If you are using the project virtual environment:

```bash
.venv\Scripts\python.exe main.py
```

## Project structure

- `main.py` – application entry point
- `app/` – modular configuration and theme helpers
- `assets/` – app branding assets, including `icon.ico`
- `servers/` – server data and world folders
- `java/` – bundled Java runtimes

## Notes
- The app icon and window icon are loaded from `assets/icon.ico`.
- This project is currently versioned as `v0.0.1`.
