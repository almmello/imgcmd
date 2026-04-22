#!/usr/bin/env node

import { config as dotenvConfig } from "dotenv";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ora from "ora";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { enUS } from "./locales/en-US.js";
import { ptBR } from "./locales/pt-BR.js";

function loadEnv() {
	const cwd = process.cwd();
	const localEnvPath = path.resolve(cwd, ".env.local");
	const defaultEnvPath = path.resolve(cwd, ".env");

	if (existsSync(localEnvPath)) {
		dotenvConfig({ path: localEnvPath, override: false });
	}

	if (existsSync(defaultEnvPath)) {
		dotenvConfig({ path: defaultEnvPath, override: false });
	}
}

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const SUPPORTED_LANGUAGES = new Set(["en-US", "pt-BR"]);
const STRINGS = { "en-US": enUS, "pt-BR": ptBR };

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
	let createSkill = null;
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

		if (arg === "--create-skill") {
			const nextValue = args[index + 1];

			if (nextValue && !nextValue.startsWith("-")) {
				createSkill = nextValue.toLowerCase();
				index += 1;
			} else {
				createSkill = "";
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

	return { prompt, modelFromArgs, showHelp, outputDir, createRule, createSkill, forcedLang };
}

function resolveLocale(value) {
	if (!value) {
		return null;
	}

	const normalized = String(value).toLowerCase().replace(/_/g, "-");

	if (normalized === "pt" || normalized.startsWith("pt-")) {
		return "pt-BR";
	}

	if (normalized === "en" || normalized.startsWith("en-")) {
		return "en-US";
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
		const language = resolveLocale(candidate);

		if (language) {
			return language;
		}
	}

	return "en-US";
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
	loadEnv();

	const {
		prompt,
		modelFromArgs,
		showHelp,
		outputDir,
		createRule,
		createSkill,
		forcedLang,
	} = parseArguments(
		process.argv.slice(2),
	);
	const language = resolveLocale(forcedLang) || detectSystemLanguage();
	const strings = STRINGS[language] ?? STRINGS["en-US"];
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

	if (createSkill !== null) {
		const validTargets = new Set(["copilot", "vscode"]);

		if (!validTargets.has(createSkill)) {
			console.error(strings.unsupportedSkillTarget);
			process.exit(1);
		}

		const skillDir = path.resolve(process.cwd(), ".github", "skills", "generate-image-file");
		await mkdir(skillDir, { recursive: true });
		const skillFilePath = path.resolve(skillDir, "SKILL.md");
		await writeFile(skillFilePath, strings.skillBody, "utf8");
		console.log(strings.skillCreated(skillFilePath));
		process.exit(0);
	}

	if (createRule !== null) {
		if (createRule !== "vscode") {
			console.error(strings.unsupportedIde);
			process.exit(1);
		}

		console.error(strings.createRuleDeprecated);
		const markdownRuleBody = STRINGS["en-US"].ruleBody;
		const rulesDir = path.resolve(process.cwd(), ".github");
		await mkdir(rulesDir, { recursive: true });
		const ruleFilePath = path.resolve(rulesDir, "copilot-instructions.md");
		await writeFile(ruleFilePath, markdownRuleBody, "utf8");
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
