#!/usr/bin/env node

import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ora from "ora";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";

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

		promptParts.push(arg);
	}

	const prompt = promptParts.join(" ").trim();
	const model =
		modelFromFlag ||
		selectedModel ||
		process.env.GEMINI_MODEL ||
		DEFAULT_MODEL;

	return { prompt, model, showHelp, outputDir, createRule };
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

function formatErrorMessage(error) {
	const detail = error?.message || "Erro desconhecido.";
	return `Falha ao gerar imagem: ${detail}`;
}

async function main() {
	const { prompt, model, showHelp, outputDir, createRule } = parseArguments(
		process.argv.slice(2),
	);

	if (showHelp) {
		console.log(`
imgcmd - Gerador de imagens via terminal

Uso:
	imgcmd "descrição da imagem"
	imgcmd --2.5 "descrição da imagem"
	imgcmd --3.1 "descrição da imagem"
	imgcmd -m <modelo> "descrição da imagem"
	imgcmd --model <modelo> "descrição da imagem"

Flags:
	--2.5            Usa o modelo gemini-2.5-flash-image
	--3.1            Usa o modelo gemini-3.1-flash-image-preview
	-m, --model      Define o nome exato do modelo (prioridade máxima)
	-d, --dir <pasta> Salva a imagem na pasta especificada
	-c, --create-rule <ide>  Cria regras para IA no projeto (vscode ou cursor)
	-h, --help       Exibe esta ajuda

Precedência de modelo:
	1) -m/--model
	2) --2.5 ou --3.1
	3) GEMINI_MODEL
	4) ${DEFAULT_MODEL}

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
   # Regras para Geração de Imagens
   Ao receber um pedido de imagem, NÃO gere código (SVG/Base64).
   Use sempre o CLI instalado no sistema via terminal:
   \`imgcmd "prompt detalhado" --dir <pasta_de_destino>\`
   ------------------------------------------------------------
`);
		process.exit(0);
	}

	if (createRule !== null) {
		let ruleFilePath;
		const markdownRuleBody = `# Regras para Geração de Imagens
Ao receber um pedido de imagem, NÃO gere código (SVG/Base64).
Use sempre o CLI instalado no sistema via terminal:
\`imgcmd "prompt detalhado" --dir <pasta_de_destino>\`
`;
		let ruleContent = markdownRuleBody;

		if (createRule === "vscode") {
			const rulesDir = path.resolve(process.cwd(), ".github");
			await mkdir(rulesDir, { recursive: true });
			ruleFilePath = path.resolve(rulesDir, "copilot-instructions.md");
		} else if (createRule === "cursor") {
			const rulesDir = path.resolve(process.cwd(), ".cursor", "rules");
			await mkdir(rulesDir, { recursive: true });
			ruleFilePath = path.resolve(rulesDir, "imgcmd.mdc");
			ruleContent = `---
description: Regras para geração de imagens via CLI imgcmd
globs: "*"
---

${markdownRuleBody}`;
		} else {
			console.error('Erro: IDE não suportado. Use "vscode" ou "cursor".');
			process.exit(1);
		}

		await writeFile(ruleFilePath, ruleContent, "utf8");
		console.log(`Regras criadas com sucesso em: ${ruleFilePath}`);
		process.exit(0);
	}

	if (!prompt) {
		console.error('Uso: imgcmd "descreva a imagem que deseja gerar"');
		process.exit(1);
	}

	const apiKey = process.env.GEMINI_API_KEY?.trim();

	if (!apiKey) {
		console.error(
			"A variável GEMINI_API_KEY não foi encontrada. Defina no ambiente ou em um arquivo .env.",
		);
		process.exit(1);
	}

	const spinner = ora("Gerando imagem com Gemini...").start();

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
			throw new Error(
				`O modelo ${model} não retornou imagem. Tente outro modelo em GEMINI_MODEL.`,
			);
		}

		const imageBuffer = Buffer.from(imageBase64, "base64");
		const fileName = generateImageFileName();
		const resolvedOutputDir = path.resolve(process.cwd(), outputDir);

		await mkdir(resolvedOutputDir, { recursive: true });
		const outputPath = path.resolve(process.cwd(), outputDir, fileName);

		await writeFile(outputPath, imageBuffer);
		spinner.succeed(`Imagem salva com sucesso em: ${outputPath}`);
	} catch (error) {
		spinner.fail(formatErrorMessage(error));
		process.exit(1);
	}
}

main();
