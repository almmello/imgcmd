#!/usr/bin/env node

import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ora from "ora";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const SUPPORTED_LANGUAGES = new Set(["en", "pt"]);

const STRINGS = {
	en: {
		usage: 'Usage: imgcmd "describe the image you want to generate"',
		apiKeyMissing:
			"IMGCMD_GEMINI_API_KEY or GEMINI_API_KEY was not found. Set one of them in your environment or in a .env file.",
		usingEnforcedModel:
			"Using enforced model from IMGCMD_FORCE_MODEL",
		spinnerGenerating: "Generating image with Gemini...",
		unknownError: "Unknown error.",
		errorGenerating: (detail) => `Failed to generate image: ${detail}`,
		modelNoImage: (model) =>
			`Model ${model} did not return an image. Try another model in IMGCMD_MODEL or GEMINI_MODEL.`,
		imageSaved: (outputPath) => `Image saved successfully at: ${outputPath}`,
		unsupportedIde: 'Error: Unsupported IDE. Use "vscode" or "cursor".',
		rulesCreated: (ruleFilePath) =>
			`Rules created successfully at: ${ruleFilePath}`,
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
	-c, --create-rule <ide>  Create AI rules in this project (vscode or cursor)
	--lang <id>              Force terminal language (en or pt)
	-h, --help               Show this help menu

.env setup:
	Create a .env file in your project root with:
	IMGCMD_GEMINI_API_KEY=your_google_api_key
	IMGCMD_MODEL=gemini-3.1-flash-image-preview
	IMGCMD_LANGUAGE=en
	# Optional sovereign override:
	IMGCMD_FORCE_MODEL=gemini-3.1-flash-image-preview
	The optional sovereign override locks the model at environment level,
	preventing CLI flags from changing it by mistake.
	If IMGCMD_FORCE_MODEL is set in .env, it always wins,
	even when an AI agent sends another model parameter.

Model precedence:
	1) IMGCMD_FORCE_MODEL (enforced override)
	2) -m/--model or --2.5/--3.1
	3) IMGCMD_MODEL
	4) GEMINI_MODEL
	5) ${defaultModel}

Agentic Tooling (AI Integration)
Teach your editor (Copilot/Cursor) to use this CLI natively.

OPTION A: Automatic Setup
$ imgcmd --create-rule vscode
$ imgcmd --create-rule cursor

OPTION B: Manual Setup (Step by Step)
1. Create the rules file in the correct directory:
VS Code: .github/copilot-instructions.md
Cursor:  .cursor/rules/imgcmd.mdc

2. Paste the content below into the file (Template):
   ------------------------------------------------------------
   # Image Generation Rules
   When asked to create an image, DO NOT generate code (SVG/Base64).
   Always use the system CLI through the terminal:
   \`imgcmd "detailed prompt" --dir <destination_folder>\`
   ------------------------------------------------------------
`,
		ruleBody: `# Image Generation Rules
When asked to create an image, DO NOT generate code (SVG/Base64).
Always use the system CLI through the terminal:
\`imgcmd "detailed prompt" --dir <destination_folder>\`
`,
		cursorFrontmatter: `---
description: Rules for image generation via imgcmd CLI
globs: "*"
---
`,
	},
	pt: {
		usage: 'Uso: imgcmd "descreva a imagem que deseja gerar"',
		apiKeyMissing:
			"As variáveis IMGCMD_GEMINI_API_KEY e GEMINI_API_KEY não foram encontradas. Defina uma delas no ambiente ou em um arquivo .env.",
		usingEnforcedModel:
			"Usando modelo imposto por IMGCMD_FORCE_MODEL",
		spinnerGenerating: "Gerando imagem com Gemini...",
		unknownError: "Erro desconhecido.",
		errorGenerating: (detail) => `Falha ao gerar imagem: ${detail}`,
		modelNoImage: (model) =>
			`O modelo ${model} não retornou imagem. Tente outro modelo em IMGCMD_MODEL ou GEMINI_MODEL.`,
		imageSaved: (outputPath) => `Imagem salva com sucesso em: ${outputPath}`,
		unsupportedIde: 'Erro: IDE não suportado. Use "vscode" ou "cursor".',
		rulesCreated: (ruleFilePath) =>
			`Regras criadas com sucesso em: ${ruleFilePath}`,
		help: (defaultModel) => `
imgcmd - Gerador seguro de imagens via terminal
Website: https://www.imgcmd.com

Dos mesmos criadores do Supa Moonbase (smoonb).
imgcmd e um produto de propriedade da Goalmoon Tecnologia LTDA.
Smoonb e a plataforma da Goalmoon para backup e migracao completa de Supabase.

Uso:
	imgcmd "descrição da imagem"
	imgcmd --2.5 "descrição da imagem"
	imgcmd --3.1 "descrição da imagem"
	imgcmd -m <modelo> "descrição da imagem"
	imgcmd --model <modelo> "descrição da imagem"
	imgcmd --lang <id> "descrição da imagem"

Flags:
	--2.5                    Usa o modelo gemini-2.5-flash-image
	--3.1                    Usa o modelo gemini-3.1-flash-image-preview
	-m, --model <nome>       Define o nome exato do modelo (prioridade máxima)
	-d, --dir <pasta>        Salva a imagem na pasta especificada
	-c, --create-rule <ide>  Cria regras para IA no projeto (vscode ou cursor)
	--lang <id>              Força o idioma do terminal (en ou pt)
	-h, --help               Exibe este menu de ajuda

Configuração de .env:
	Crie um arquivo .env na raiz do projeto com:
	IMGCMD_GEMINI_API_KEY=sua_chave_google
	IMGCMD_MODEL=gemini-3.1-flash-image-preview
	IMGCMD_LANGUAGE=pt
	# Trava soberana opcional:
	IMGCMD_FORCE_MODEL=gemini-3.1-flash-image-preview
	A trava soberana opcional fixa o modelo no ambiente,
	evitando que flags de CLI mudem esse modelo por engano.
	Se IMGCMD_FORCE_MODEL estiver definido no .env, ele sempre prevalece,
	mesmo que um agente de IA envie outro parametro de modelo.

Precedência de modelo:
	1) IMGCMD_FORCE_MODEL (trava de segurança)
	2) -m/--model ou --2.5/--3.1
	3) IMGCMD_MODEL
	4) GEMINI_MODEL
	5) ${defaultModel}

Agentic Tooling (Integração com IA)
Ensine seu editor (Copilot/Cursor) a usar este CLI nativamente.

OPÇÃO A: Configuração Automática
$ imgcmd --create-rule vscode
$ imgcmd --create-rule cursor

OPÇÃO B: Configuração Manual (Passo a Passo)
1. Crie o arquivo de regras no diretório correto:
VS Code: .github/copilot-instructions.md
Cursor:  .cursor/rules/imgcmd.mdc

2. Cole o conteúdo abaixo dentro do arquivo (Template):
   ------------------------------------------------------------
   # Image Generation Rules
   When asked to create an image, DO NOT generate code (SVG/Base64).
   Always use the system CLI through the terminal:
   \`imgcmd "detailed prompt" --dir <destination_folder>\`
   ------------------------------------------------------------
`,
	},
};

function generateImageFileName(date = new Date()) {
	const year = String(date.getFullYear());
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");
	const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

	return `imgcmd-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}.png`;
}

function parseArguments(args) {
	const promptParts = [];
	let selectedModel = null;
	let modelFromFlag = null;
	let showHelp = false;
	let outputDir = process.cwd();
	let createRule = null;
	let forcedLang = null;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if (arg === "-h" || arg === "--help") {
			showHelp = true;
			continue;
		}

		if (arg === "--2.5") {
			selectedModel = "gemini-2.5-flash-image";
			continue;
		}

		if (arg === "--3.1") {
			selectedModel = "gemini-3.1-flash-image-preview";
			continue;
		}

		if (arg === "--model" || arg === "-m") {
			const nextValue = args[index + 1];

			if (nextValue && !nextValue.startsWith("-")) {
				modelFromFlag = nextValue;
				index += 1;
			}

			continue;
		}

		if (arg === "--dir" || arg === "-d") {
			const nextValue = args[index + 1];

			if (nextValue && !nextValue.startsWith("-")) {
				outputDir = nextValue;
				index += 1;
			}

			continue;
		}

		if (arg === "--create-rule" || arg === "-c") {
			const nextValue = args[index + 1];

			if (nextValue) {
				createRule = nextValue.toLowerCase();
				index += 1;
			} else {
				createRule = "";
			}

			continue;
		}

		if (arg === "--lang") {
			const nextValue = args[index + 1];

			if (nextValue && !nextValue.startsWith("-")) {
				forcedLang = nextValue.toLowerCase();
				index += 1;
			}

			continue;
		}

		if (arg.startsWith("--lang=")) {
			const inlineValue = arg.slice("--lang=".length).trim();

			if (inlineValue) {
				forcedLang = inlineValue.toLowerCase();
			}

			continue;
		}

		promptParts.push(arg);
	}

	const prompt = promptParts.join(" ").trim();
	const modelFromArgs = modelFromFlag || selectedModel || null;

	return { prompt, modelFromArgs, showHelp, outputDir, createRule, forcedLang };
}

function normalizeLanguage(value) {
	if (!value) {
		return null;
	}

	const normalized = String(value).toLowerCase();

	if (normalized.startsWith("pt")) {
		return "pt";
	}

	if (normalized.startsWith("en")) {
		return "en";
	}

	if (SUPPORTED_LANGUAGES.has(normalized)) {
		return normalized;
	}

	return null;
}

function detectSystemLanguage() {
	const candidates = [
		process.env.IMGCMD_LANGUAGE,
		process.env.LANG,
		process.env.LC_ALL,
		process.env.LC_MESSAGES,
		process.env.LANGUAGE,
		Intl.DateTimeFormat().resolvedOptions().locale,
	];

	for (const candidate of candidates) {
		const language = normalizeLanguage(candidate);

		if (language) {
			return language;
		}
	}

	return "en";
}

function extractImageBase64(response) {
	const candidates = response?.candidates ?? [];

	for (const candidate of candidates) {
		const parts = candidate?.content?.parts ?? [];

		for (const part of parts) {
			const inlineData = part?.inlineData ?? part?.inline_data;
			const mimeType = inlineData?.mimeType ?? inlineData?.mime_type;
			const base64Data = inlineData?.data;

			if (mimeType?.startsWith("image/") && base64Data) {
				return base64Data;
			}
		}
	}

	return null;
}

function formatErrorMessage(error, strings) {
	const detail = error?.message || strings.unknownError;
	return strings.errorGenerating(detail);
}

async function main() {
	const {
		prompt,
		modelFromArgs,
		showHelp,
		outputDir,
		createRule,
		forcedLang,
	} = parseArguments(
		process.argv.slice(2),
	);
	const language = normalizeLanguage(forcedLang) || detectSystemLanguage();
	const strings = STRINGS[language] || STRINGS.en;
	const model =
		process.env.IMGCMD_FORCE_MODEL ||
		modelFromArgs ||
		process.env.IMGCMD_MODEL ||
		process.env.GEMINI_MODEL ||
		DEFAULT_MODEL;

	if (process.env.IMGCMD_FORCE_MODEL) {
		console.log(strings.usingEnforcedModel);
	}

	if (showHelp) {
		console.log(strings.help(DEFAULT_MODEL));
		process.exit(0);
	}

	if (createRule !== null) {
		let ruleFilePath;
		const markdownRuleBody = STRINGS.en.ruleBody;
		let ruleContent = markdownRuleBody;

		if (createRule === "vscode") {
			const rulesDir = path.resolve(process.cwd(), ".github");
			await mkdir(rulesDir, { recursive: true });
			ruleFilePath = path.resolve(rulesDir, "copilot-instructions.md");
		} else if (createRule === "cursor") {
			const rulesDir = path.resolve(process.cwd(), ".cursor", "rules");
			await mkdir(rulesDir, { recursive: true });
			ruleFilePath = path.resolve(rulesDir, "imgcmd.mdc");
			ruleContent = `${STRINGS.en.cursorFrontmatter}
${markdownRuleBody}`;
		} else {
			console.error(strings.unsupportedIde);
			process.exit(1);
		}

		await writeFile(ruleFilePath, ruleContent, "utf8");
		console.log(strings.rulesCreated(ruleFilePath));
		process.exit(0);
	}

	if (!prompt) {
		console.error(strings.usage);
		process.exit(1);
	}

	const apiKey =
		process.env.IMGCMD_GEMINI_API_KEY?.trim() ||
		process.env.GEMINI_API_KEY?.trim();

	if (!apiKey) {
		console.error(strings.apiKeyMissing);
		process.exit(1);
	}

	const spinner = ora(strings.spinnerGenerating).start();

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const imageModel = genAI.getGenerativeModel({ model });

		const result = await imageModel.generateContent({
			contents: [{ role: "user", parts: [{ text: prompt }] }],
			generationConfig: {
				responseModalities: ["TEXT", "IMAGE"],
			},
		});

		const imageBase64 = extractImageBase64(result?.response);

		if (!imageBase64) {
			throw new Error(strings.modelNoImage(model));
		}

		const imageBuffer = Buffer.from(imageBase64, "base64");
		const fileName = generateImageFileName();
		const resolvedOutputDir = path.resolve(process.cwd(), outputDir);

		await mkdir(resolvedOutputDir, { recursive: true });
		const outputPath = path.resolve(process.cwd(), outputDir, fileName);

		await writeFile(outputPath, imageBuffer);
		spinner.succeed(strings.imageSaved(outputPath));
	} catch (error) {
		spinner.fail(formatErrorMessage(error, strings));
		process.exit(1);
	}
}

main();
