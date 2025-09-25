# Permit AI Helper Extension

A small helper project for the Permit AI Helper (VS Code extension / tooling). This repository currently contains the source and assets for the extension — work in progress.

> Note: I inferred this is a VS Code extension from the repository name. If that's incorrect, update the "Project type" section below or provide more details and I can tailor this README.

## Project type
This repository is intended to be a VS Code extension (or related helper tooling). It may also contain Node.js or Python tooling. The setup instructions below provide steps for both common flows.

## Prerequisites
- Git (for source control)
- One of the following depending on the project: Node.js (>=14) and npm/yarn, or Python 3.8+ and pip
- Visual Studio Code (recommended)

## Quick setup
Pick the section that matches the project files in the repo.

### If this is a Node.js / VS Code extension
1. Install dependencies:

```bash
npm install
# or
yarn
```

2. Common developer commands (may vary):

```bash
# build
npm run build
# run in development mode / launch extension host
npm run watch
# run tests
npm test
```

If you don't have a `package.json`, skip these steps and check for other language files.

### If this is a Python project
1. Create a virtual environment and install requirements:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run tests or check scripts if provided (for example):

```bash
pytest
```

## Development
- Open the repository in VS Code.
- Use the Debug panel to run the extension host (if this is a VS Code extension).
- Follow existing CONTRIBUTING.md or GitHub issue templates if present.

## Contributing
Contributions are welcome. A minimal workflow:

1. Fork the repository.
2. Create a branch for your work.
3. Open a pull request describing your changes.

If you'd like, add a `CONTRIBUTING.md` with project-specific guidelines.

## License
No license file detected. Add a `LICENSE` file (for example, MIT) if you want to specify terms.

## Contact
Repository owner: direwolfvm

---

If you'd like, I can update the README with specific build and run instructions after you tell me what language or framework this project uses (for example, Node/TypeScript or Python).