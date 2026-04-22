/**
 * Locale: English — United States (en-US)
 * Primary locale for imgcmd CLI.
 *
 * ruleBody: EN-only legacy template for --create-rule vscode.
 *   Always accessed via STRINGS["en-US"].ruleBody — never via resolved locale.
 * cursorFrontmatter: removed — Cursor support dropped in this version.
 * skillBody: localized — follows the active display language.
 *   Accessed via the resolved strings.skillBody.
 */

export const enUS = {
	usage: 'Usage: imgcmd "describe the image you want to generate"',
	apiKeyMissing:
		"IMGCMD_GEMINI_API_KEY or GEMINI_API_KEY was not found. Set one of them in your environment or in a .env file.",
	usingEnforcedModel: "Using enforced model from IMGCMD_FORCE_MODEL",
	spinnerGenerating: "Generating image with Gemini...",
	unknownError: "Unknown error.",
	errorGenerating: (detail) => `Failed to generate image: ${detail}`,
	modelNoImage: (model) =>
		`Model ${model} did not return an image. Try another model in IMGCMD_MODEL or GEMINI_MODEL.`,
	imageSaved: (outputPath) => `Image saved successfully at: ${outputPath}`,
	unsupportedIde: 'Error: Unsupported IDE. Use "vscode".',
	rulesCreated: (ruleFilePath) =>
		`Rules created successfully at: ${ruleFilePath}`,
	createRuleDeprecated:
		"[imgcmd] Deprecated: --create-rule is superseded by --create-skill. This legacy command remains available for backward compatibility.",
	skillCreated: (skillFilePath) =>
		`Agent Skill created successfully at: ${skillFilePath}`,
	unsupportedSkillTarget:
		'Error: Unsupported target. Use "copilot" or "vscode".',

	help: (defaultModel) => `
imgcmd - Secure image generation from your terminal
Website: https://www.imgcmd.com

From the same creators of Supa Moonbase (smoonb).
imgcmd is a product owned by Goalmoon Tecnologia LTDA.
Smoonb is Goalmoon's complete Supabase backup and migration platform.

Usage:
	imgcmd "image description"
	imgcmd --2.5 "image description"
	imgcmd --3.1 "image description"
	imgcmd -m <model> "image description"
	imgcmd --model <model> "image description"
	imgcmd --lang <id> "image description"

Flags:
	--2.5                    Use gemini-2.5-flash-image
	--3.1                    Use gemini-3.1-flash-image-preview
	-m, --model <name>       Set an explicit model name (highest priority)
	-d, --dir <folder>       Save the image in a specific folder
	--create-skill <target>  Create Agent Skill file (copilot or vscode)
	-c, --create-rule vscode Create VS Code rules file — DEPRECATED; cursor no longer supported
	--lang <id>              Force terminal language (en-US or pt-BR; aliases en and pt are accepted)
	-h, --help               Show this help menu

.env setup:
	Supported files (loaded in priority order):
	  .env.local  (first — preferred for secrets, keep out of git)
	  .env        (fallback)

	Add variables to either file:
	IMGCMD_GEMINI_API_KEY=your_google_api_key
	IMGCMD_MODEL=gemini-3.1-flash-image-preview
	# Lock display language (overrides OS auto-detection):
	IMGCMD_LANGUAGE=en-US
	# IMGCMD_LANGUAGE=pt-BR     # Uncomment to force Portuguese (Brazil)
	# Optional sovereign override:
	IMGCMD_FORCE_MODEL=gemini-3.1-flash-image-preview
	The optional sovereign override locks the model at environment level,
	preventing CLI flags from changing it by mistake.
	If IMGCMD_FORCE_MODEL is set in .env or .env.local, it always wins,
	even when an AI agent sends another model parameter.

Model precedence:
	1) IMGCMD_FORCE_MODEL (enforced override)
	2) -m/--model or --2.5/--3.1
	3) IMGCMD_MODEL
	4) GEMINI_MODEL
	5) ${defaultModel}

Agentic Tooling (AI Integration)
Teach your editor to use this CLI natively.

OPTION A: Agent Skills (GitHub Copilot / VS Code)
$ imgcmd --create-skill copilot
  Also accepted: imgcmd --create-skill vscode
  Generated file: .github/skills/generate-image-file/SKILL.md

OPTION B: Legacy Rules (deprecated, vscode only)
$ imgcmd --create-rule vscode

OPTION C: Manual Setup (Step by Step)
1. Create the rules file in the correct directory:
VS Code: .github/copilot-instructions.md

2. Paste the content below into the file (Template):
   ------------------------------------------------------------
   # Image Generation Rules
   When asked to create an image, DO NOT generate code (SVG/Base64).
   Always use the system CLI through the terminal:
   \`imgcmd "detailed prompt" --dir <destination_folder>\`
   ------------------------------------------------------------
`,

	// ----------------------------------------------------------------
	// ruleBody: EN-only legacy template. Always via STRINGS["en-US"].ruleBody.
	// cursorFrontmatter: removed (Cursor support dropped).
	// skillBody: localized — accessed via resolved strings.skillBody.
	// ----------------------------------------------------------------

	ruleBody: `# Image Generation Rules
When asked to create an image, DO NOT generate code (SVG/Base64).
Always use the system CLI through the terminal:
\`imgcmd "detailed prompt" --dir <destination_folder>\`
`,

	skillBody: `---
name: generate-image-file
description: Generate real PNG image files from text prompts using the local imgcmd CLI. Use this when the user asks to create, generate, draw, render, design, make, export, save, or materialize an image, illustration, icon, logo, banner, OpenGraph image, favicon, avatar, hero visual, or other visual asset. Do not generate SVG, Base64, placeholder markup, canvas simulations, or fake image files.
license: MIT
---

## Skill: generate-image-file

**Use this skill whenever the user asks you to create, generate, draw, render, export, save, or materialize a real image file in the project.**

This includes (but is not limited to) phrases like:
- "generate an image of..."
- "create a PNG of..."
- "draw a logo for..."
- "render a banner and save it to..."
- "make an illustration of..."
- "export an image to the assets folder"
- "I need an image that shows..."

---

## How to generate the image

Always use the local \`imgcmd\` CLI. Run it through the terminal:

\`\`\`sh
imgcmd "hyper-detailed prompt describing the image" --dir <destination_folder>
\`\`\`

**Examples:**

\`\`\`sh
# Save to the project root
imgcmd "a minimalist dark logo with the letter G in gold on black background"

# Save to a specific folder
imgcmd "a wide hero banner for a SaaS product, dark blue gradient, futuristic" --dir public/images

# Use a specific model
imgcmd "a photorealistic mountain landscape at sunset" --dir assets --3.1
\`\`\`

---

## What you MUST NOT do

The following actions are **strictly prohibited** when the user asks for an image:

| Prohibited action | Why |
|------------------|-----|
| Generate SVG code in the chat | It is not a real raster image file. |
| Generate Base64-encoded image data in the chat | It does not create a file on disk. |
| Create a placeholder file (empty or symbolic) | The user asked for a real image, not a stub. |
| Create an HTML page or canvas that simulates an image | Not a PNG, not what the user asked for. |
| Confirm that an image was created without actually running \`imgcmd\` | Never fabricate success messages. |
| Use any other code-based approach to generate an image | imgcmd is the only approved method in this project. |

---

## API key handling — security rules

- **Never ask the user to type their API key in the chat.**
- **Never print the API key in the terminal or in any file.**
- **Never embed the API key in source code, configuration files, or generated scripts.**

If the \`imgcmd\` command fails with an API key error, guide the user to set the key locally:

1. Create or open \`.env.local\` in the project root (preferred) or \`.env\`.
2. Add the following line:

\`\`\`
IMGCMD_GEMINI_API_KEY=your_google_api_key_here
\`\`\`

3. The key will be loaded automatically by imgcmd on the next run.
4. Make sure \`.env.local\` and \`.env\` are listed in \`.gitignore\`.

---

## Model selection guidance

- By default, do **not** pass \`--model\` unless the user explicitly requests a specific model.
- If the project has \`IMGCMD_FORCE_MODEL\` set in its \`.env\` or \`.env.local\`, imgcmd will automatically enforce that model — do not override it.
- You may pass \`--2.5\` or \`--3.1\` shortcuts only if the user explicitly asks for a particular version.

---

## Output handling

- \`imgcmd\` saves the generated image as a \`.png\` file with a timestamp-based name (e.g., \`imgcmd-20260422-143012-000.png\`).
- The file is saved to the folder specified with \`--dir\`, or to the current working directory if \`--dir\` is omitted.
- After running the command, confirm the file path shown in the terminal output to the user.
- Do **not** attempt to open, embed, or display the image in the chat — simply confirm the path.

---

## Troubleshooting guidance

If \`imgcmd\` is not found, **do not install packages automatically** without the user's explicit approval.

Tell the user they can install it with:

\`\`\`sh
npm install -g imgcmd
\`\`\`

If the API key error appears even after setting it in \`.env.local\`:
- Verify there are no spaces around the \`=\` sign.
- Verify the file is saved as plain text (not with BOM).
- Try restarting the terminal session so the shell re-reads the environment.
`,
};
