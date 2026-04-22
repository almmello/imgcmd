/**
 * Locale: Portuguese — Brazil (pt-BR)
 * Secondary locale for imgcmd CLI.
 *
 * Note: ruleBody and cursorFrontmatter are EN-only AI instruction fragments
 * (always accessed via STRINGS["en-US"].* — intentionally absent from this file).
 * skillBody IS present: the SKILL.md file follows the active display language.
 *
 * Accent fixes applied vs 0.0.4 (9 corrections):
 *   createRuleDeprecated : "substituido"   → "substituído"
 *   createRuleDeprecated : "disponivel"    → "disponível"
 *   unsupportedSkillTarget: "nao"          → "não"
 *   help() branding      : "e um produto"  → "é um produto"
 *   help() branding      : "e a plataforma"→ "é a plataforma"
 *   help() deprecation   : "substituido"   → "substituído"
 *   help() deprecation   : "disponivel"    → "disponível"
 *   help() .env section  : "variaveis"     → "variáveis"
 *   help() .env section  : "parametro"     → "parâmetro"
 */

export const ptBR = {
	usage: 'Uso: imgcmd "descreva a imagem que deseja gerar"',
	apiKeyMissing:
		"As variáveis IMGCMD_GEMINI_API_KEY e GEMINI_API_KEY não foram encontradas. Defina uma delas no ambiente ou em um arquivo .env.",
	usingEnforcedModel: "Usando modelo imposto por IMGCMD_FORCE_MODEL",
	spinnerGenerating: "Gerando imagem com Gemini...",
	unknownError: "Erro desconhecido.",
	errorGenerating: (detail) => `Falha ao gerar imagem: ${detail}`,
	modelNoImage: (model) =>
		`O modelo ${model} não retornou imagem. Tente outro modelo em IMGCMD_MODEL ou GEMINI_MODEL.`,
	imageSaved: (outputPath) => `Imagem salva com sucesso em: ${outputPath}`,
	unsupportedIde: 'Erro: IDE não suportado. Use "vscode".',
	rulesCreated: (ruleFilePath) =>
		`Regras criadas com sucesso em: ${ruleFilePath}`,
	createRuleDeprecated:
		"[imgcmd] Descontinuado: --create-rule foi substituído por --create-skill. Este comando legado continua disponível para compatibilidade.",
	skillCreated: (skillFilePath) =>
		`Agent Skill criado com sucesso em: ${skillFilePath}`,
	unsupportedSkillTarget:
		'Erro: Alvo não suportado. Use "copilot" ou "vscode".',

	help: (defaultModel) => `
imgcmd - Gerador seguro de imagens via terminal
Website: https://www.imgcmd.com

Dos mesmos criadores do Supa Moonbase (smoonb).
imgcmd é um produto de propriedade da Goalmoon Tecnologia LTDA.
Smoonb é a plataforma da Goalmoon para backup e migração completa de Supabase.

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
	--create-skill <alvo>    Cria arquivo Agent Skill (copilot ou vscode)
	-c, --create-rule vscode Cria arquivo de regras VS Code — DESCONTINUADO; cursor não suportado
	--lang <id>              Força o idioma do terminal (en-US ou pt-BR; aliases en e pt são aceitos)
	-h, --help               Exibe este menu de ajuda

Configuração de .env:
	Arquivos suportados (em ordem de prioridade):
	  .env.local  (primeiro — preferido para segredos, manter fora do git)
	  .env        (fallback)

	Adicione variáveis em qualquer um dos arquivos:
	IMGCMD_GEMINI_API_KEY=sua_chave_google
	IMGCMD_MODEL=gemini-3.1-flash-image-preview
	# Fixa o idioma de exibição (substitui detecção automática do SO):
	IMGCMD_LANGUAGE=pt-BR
	# IMGCMD_LANGUAGE=en-US     # Descomente para forçar inglês
	# Trava soberana opcional:
	IMGCMD_FORCE_MODEL=gemini-3.1-flash-image-preview
	A trava soberana opcional fixa o modelo no ambiente,
	evitando que flags de CLI mudem esse modelo por engano.
	Se IMGCMD_FORCE_MODEL estiver definido no .env ou .env.local, ele sempre prevalece,
	mesmo que um agente de IA envie outro parâmetro de modelo.

Precedência de modelo:
	1) IMGCMD_FORCE_MODEL (trava de segurança)
	2) -m/--model ou --2.5/--3.1
	3) IMGCMD_MODEL
	4) GEMINI_MODEL
	5) ${defaultModel}

Agentic Tooling (Integração com IA)
Ensine seu editor a usar este CLI nativamente.

OPÇÃO A: Agent Skills (GitHub Copilot / VS Code)
$ imgcmd --create-skill copilot
  Também aceito: imgcmd --create-skill vscode
  Arquivo gerado: .github/skills/generate-image-file/SKILL.md

OPÇÃO B: Regras Legadas (descontinuado, somente vscode)
$ imgcmd --create-rule vscode

OPÇÃO C: Configuração Manual (Passo a Passo)
1. Crie o arquivo de regras no diretório correto:
VS Code: .github/copilot-instructions.md

2. Cole o conteúdo abaixo dentro do arquivo (Template):
   ------------------------------------------------------------
   # Image Generation Rules
   When asked to create an image, DO NOT generate code (SVG/Base64).
   Always use the system CLI through the terminal:
   \`imgcmd "detailed prompt" --dir <destination_folder>\`
   ------------------------------------------------------------
`,

	skillBody: `---
name: generate-image-file
description: Gera arquivos PNG reais a partir de prompts de texto usando o CLI local imgcmd. Use quando o usuário pedir para criar, gerar, desenhar, renderizar, projetar, fazer, exportar, salvar ou materializar uma imagem, ilustração, ícone, logo, banner, imagem OpenGraph, favicon, avatar, visual hero ou outro ativo visual. Não gere SVG, Base64, marcação de placeholder, simulações de canvas ou arquivos de imagem falsos.
license: MIT
---

## Skill: generate-image-file

**Use esta skill sempre que o usuário pedir para criar, gerar, desenhar, renderizar, exportar, salvar ou materializar um arquivo de imagem real no projeto.**

Isso inclui (mas não se limita a) frases como:
- "gere uma imagem de..."
- "crie um PNG de..."
- "desenhe um logo para..."
- "renderize um banner e salve em..."
- "faça uma ilustração de..."
- "exporte uma imagem para a pasta de assets"
- "Preciso de uma imagem que mostre..."

---

## Como gerar a imagem

Sempre use o CLI local \`imgcmd\`. Execute-o pelo terminal:

\`\`\`sh
imgcmd "prompt detalhado descrevendo a imagem" --dir <pasta_de_destino>
\`\`\`

**Exemplos:**

\`\`\`sh
# Salvar na raiz do projeto
imgcmd "um logo minimalista escuro com a letra G em dourado sobre fundo preto"

# Salvar em pasta específica
imgcmd "um banner hero amplo para produto SaaS, gradiente azul escuro, futurista" --dir public/images

# Usar modelo específico
imgcmd "uma paisagem montanhosa fotorrealista ao pôr do sol" --dir assets --3.1
\`\`\`

---

## O que você NÃO DEVE fazer

As seguintes ações são **estritamente proibidas** quando o usuário pede uma imagem:

| Ação proibida | Motivo |
|--------------|--------|
| Gerar código SVG no chat | Não é um arquivo de imagem raster real. |
| Gerar dados de imagem em Base64 no chat | Não cria um arquivo em disco. |
| Criar um arquivo de placeholder (vazio ou simbólico) | O usuário pediu uma imagem real, não um stub. |
| Criar uma página HTML ou canvas que simule uma imagem | Não é PNG, não é o que o usuário pediu. |
| Confirmar que uma imagem foi criada sem executar \`imgcmd\` de fato | Nunca fabrique mensagens de sucesso. |
| Usar qualquer outra abordagem baseada em código para gerar imagem | imgcmd é o único método aprovado neste projeto. |

---

## Tratamento de chave de API — regras de segurança

- **Nunca peça ao usuário para digitar a chave de API no chat.**
- **Nunca exiba a chave de API no terminal ou em qualquer arquivo.**
- **Nunca incorpore a chave de API em código-fonte, arquivos de configuração ou scripts gerados.**

Se o comando \`imgcmd\` falhar com erro de chave de API, oriente o usuário a configurar a chave localmente:

1. Crie ou abra \`.env.local\` na raiz do projeto (preferido) ou \`.env\`.
2. Adicione a seguinte linha:

\`\`\`
IMGCMD_GEMINI_API_KEY=sua_chave_google_aqui
\`\`\`

3. A chave será carregada automaticamente pelo imgcmd na próxima execução.
4. Certifique-se de que \`.env.local\` e \`.env\` estão listados no \`.gitignore\`.

---

## Orientações para seleção de modelo

- Por padrão, **não** passe \`--model\` a menos que o usuário solicite explicitamente um modelo específico.
- Se o projeto tiver \`IMGCMD_FORCE_MODEL\` configurado no \`.env\` ou \`.env.local\`, o imgcmd vai impor esse modelo automaticamente — não o substitua.
- Você pode passar os atalhos \`--2.5\` ou \`--3.1\` apenas se o usuário pedir explicitamente uma versão específica.

---

## Tratamento de saída

- O \`imgcmd\` salva a imagem gerada como arquivo \`.png\` com nome baseado em timestamp (ex.: \`imgcmd-20260422-143012-000.png\`).
- O arquivo é salvo na pasta especificada com \`--dir\`, ou no diretório de trabalho atual se \`--dir\` for omitido.
- Após executar o comando, confirme ao usuário o caminho do arquivo exibido na saída do terminal.
- **Não** tente abrir, incorporar ou exibir a imagem no chat — apenas confirme o caminho.

---

## Orientações para resolução de problemas

Se \`imgcmd\` não for encontrado, **não instale pacotes automaticamente** sem a aprovação explícita do usuário.

Informe ao usuário que pode instalar com:

\`\`\`sh
npm install -g imgcmd
\`\`\`

Se o erro de chave de API aparecer mesmo após configurá-la no \`.env.local\`:
- Verifique se não há espaços ao redor do sinal \`=\`.
- Verifique se o arquivo está salvo como texto simples (sem BOM).
- Tente reiniciar a sessão do terminal para que o shell releia o ambiente.
`,
};
