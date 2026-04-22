# imgcmd

## Powered by Smoonb

Smoonb is the official sponsor of imgcmd.
From the same creators of [smoonb](#supa-moonbase-smoonb).
Website: https://www.imgcmd.com

imgcmd is a secure CLI for developers who need real image files from prompts without relying on fragile chat-generated code.

## Why imgcmd

- Security-first workflow: API keys stay on your machine.
- Reliable output: saves binary PNG files directly to disk.
- Fast developer UX: one command, one result, no editor lock-in.
- Agentic Tooling support: teach Copilot and Cursor to call imgcmd natively.

## Installation

Install globally so the command is available system-wide:

```bash
npm install -g imgcmd
```

After installation, `imgcmd` is available in any terminal directory.

## Configuration

Use IMGCMD-prefixed variables as the primary configuration layer for predictable behavior in local and agent-driven workflows.

Set your API key (preferred and legacy fallback):

```bash
export IMGCMD_GEMINI_API_KEY="your_google_api_key"
# Fallback (legacy compatibility)
export GEMINI_API_KEY="your_google_api_key"
```

Optional default model (preferred and fallback):

```bash
export IMGCMD_MODEL="gemini-3.1-flash-image-preview"
# Fallback (legacy compatibility)
export GEMINI_MODEL="gemini-3.1-flash-image-preview"
```

Optional language preference at environment level:

```bash
export IMGCMD_LANGUAGE="en"
```

Sovereign override for safety-sensitive agent flows:

```bash
export IMGCMD_FORCE_MODEL="gemini-3.1-flash-image-preview"
```

When `IMGCMD_FORCE_MODEL` is set, it overrides all CLI model flags and other model settings.

## Agentic Tooling

imgcmd generates Agent Skills and legacy rule files so your AI assistant uses the CLI instead of producing SVG/Base64 code in chat.

### Agent Skills (recommended — GitHub Copilot / VS Code)

```bash
imgcmd --create-skill copilot
# Also accepted:
imgcmd --create-skill vscode
```

Generated file:

- `.github/skills/generate-image-file/SKILL.md`

### Legacy rules (deprecated)

```bash
imgcmd --create-rule vscode
imgcmd --create-rule cursor
```

Generated rule files:

- VS Code: `.github/copilot-instructions.md`
- Cursor: `.cursor/rules/imgcmd.mdc`

> **Note:** `--create-rule` is deprecated. Use `--create-skill` instead. The legacy command continues to work for backward compatibility.

### Manual setup

Create the correct rule file and paste this template:

```md
# Image Generation Rules
When asked to create an image, DO NOT generate code (SVG/Base64).
Always use the system CLI through the terminal:
`imgcmd "detailed prompt" --dir <destination_folder>`
```

For Cursor, include this frontmatter at the top of `.cursor/rules/imgcmd.mdc`:

```yaml
---
description: Rules for image generation via imgcmd CLI
globs: "*"
---
```

## Language Support

imgcmd automatically detects your terminal language from system locale variables.

- Supported built-in languages: English (`en`) and Portuguese (`pt`)
- Default fallback language: English (`en`)
- You can force the language manually with:

```bash
imgcmd --lang en "your prompt"
imgcmd --lang pt "seu prompt"
```

Rule generation via `--create-rule` is intentionally written in English for better AI model interoperability.

## Usage Examples

Basic usage:

```bash
imgcmd "A minimal rocket icon, transparent background"
```

Organize output folders:

```bash
imgcmd "Landing page hero illustration" --dir assets/img
```

Quick model selection:

```bash
imgcmd "Modern analytics dashboard concept" --3.1
```

Explicit model control:

```bash
imgcmd "Campaign mascot in 3D" -m <specific_model_name>
```

## CLI Flags

- `--2.5`: use `gemini-2.5-flash-image`
- `--3.1`: use `gemini-3.1-flash-image-preview`
- `-m`, `--model <name>`: set explicit model name
- `-d`, `--dir <folder>`: output directory
- `--create-skill <target>`: create Agent Skill file (`copilot` or `vscode`)
- `-c`, `--create-rule <ide>`: generate AI rules — **deprecated**, use `--create-skill`
- `--lang <id>`: force language (`en` or `pt`)
- `-h`, `--help`: show help

### .env setup

imgcmd loads environment variables from the following files in priority order:

1. `.env.local` — loaded first; preferred for secrets; keep out of version control
2. `.env` — fallback

Variables already set in your shell or CI environment always take priority over both files.

Create `.env.local` or `.env` in the project root:

```dotenv
IMGCMD_GEMINI_API_KEY=your_google_api_key
IMGCMD_MODEL=gemini-3.1-flash-image-preview
IMGCMD_LANGUAGE=en
# Optional sovereign override:
IMGCMD_FORCE_MODEL=gemini-3.1-flash-image-preview
```

The optional sovereign override (`IMGCMD_FORCE_MODEL`) is a safety control for teams and AI agents: it locks the model at environment level so no CLI flag (`-m`, `--2.5`, `--3.1`) can switch to a different model by mistake.
When `IMGCMD_FORCE_MODEL` is set, that value always wins, even if an AI agent sends a prompt command with another model parameter.

Legacy compatibility remains available via `GEMINI_API_KEY` and `GEMINI_MODEL`.

Model precedence:

1. `IMGCMD_FORCE_MODEL` (enforced override)
2. `-m`/`--model` or `--2.5`/`--3.1`
3. `IMGCMD_MODEL`
4. `GEMINI_MODEL`
5. internal default fallback

## About the Creators

imgcmd is a free tool maintained by the smoonb.com team and owned by Goalmoon Tecnologia LTDA.

If you like this project, check Smoonb to discover a broader platform for sales productivity and AI-enhanced operations.

## Supa Moonbase (smoonb)

Complete Supabase backup and migration tool.

Backup and restore: complete and simple, as it should be.

Developed and owned by: Goalmoon Tecnologia LTDA  
Website: https://www.smoonb.com  
GitHub: https://github.com/almmello/smoonb

### Objective

smoonb solves the problem of tools that only back up the PostgreSQL database while ignoring critical Supabase components.

### Backup Components

smoonb performs full backup coverage of your Supabase project:

- Database PostgreSQL (full backup via pg_dumpall and split SQL files, matching Dashboard behavior)
- Database extensions and settings
- Custom roles
- Edge Functions (automatic download from server)
- Auth settings (via Management API)
- Storage buckets (metadata, settings, and files via Management API + Supabase Client, ZIP in Dashboard format)
- Realtime settings (7 parameters captured interactively)
- Supabase .temp files
- Migrations (all project migrations via supabase migration fetch)

## License

This project is licensed under MIT. See `LICENSE` for details.
