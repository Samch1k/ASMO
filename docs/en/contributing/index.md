# Contributing

Thank you for your interest in contributing to ASMO! This guide will help you get started.

## Table of Contents

- [Development Setup](./setup.md)
- [Coding Standards](./coding-standards.md)
- [Testing](./testing.md)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Samch1k/ASMO.git
cd ASMO

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Ways to Contribute

### Report Bugs

Found a bug? [Open an issue](https://github.com/Samch1k/ASMO/issues/new) with:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details

### Suggest Features

Have an idea? [Open a discussion](https://github.com/Samch1k/ASMO/discussions) first to get feedback.

### Submit Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

### Improve Documentation

Documentation improvements are always welcome:

- Fix typos
- Clarify explanations
- Add examples
- Translate content

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn

## Development Workflow

```
Fork → Branch → Code → Test → PR → Review → Merge
```

### Branching

- `main` - Stable releases
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new workflow
fix: resolve agent timeout issue
docs: update installation guide
test: add unit tests for TaskManager
refactor: simplify complexity analyzer
```

## Getting Help

- Read the [documentation](../index.md)
- Check [existing issues](https://github.com/Samch1k/ASMO/issues)
- Ask in [discussions](https://github.com/Samch1k/ASMO/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
