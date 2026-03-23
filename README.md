# 🖼️ imgcmd

## 🚀 Powered by Smoonb - A solução completa para sua produtividade comercial.

> O gerador de imagens via terminal seguro, focado em desenvolvedores e pronto para fluxos com IA.

Gerar imagens direto pelo chat do editor muitas vezes resulta em arquivos corrompidos, prompts mal executados ou automações frágeis. O **imgcmd** resolve isso com uma abordagem simples: usar o terminal, salvar o binário real da imagem e manter o controle total nas mãos do desenvolvedor.

O projeto foi pensado para times que querem **segurança**, **previsibilidade** e **integração nativa com agentes de IA** sem depender de gambiarras, extensões obscuras ou geração de SVG/Base64 no chat.

## ✨ O que o imgcmd entrega

- Segurança em primeiro lugar: sua chave `GEMINI_API_KEY` fica na sua máquina, e o CLI fala diretamente com os SDKs oficiais.
- Arquivo real no disco: a imagem é convertida para `Buffer` e salva como `.png` na pasta escolhida.
- Fluxo rápido para desenvolvedores: rode um comando e receba o asset sem sair do terminal.
- Organização de saída: escolha diretórios específicos para manter `assets`, `img`, `branding` ou qualquer estrutura do projeto.
- Agentic Tooling: ensine Copilot e Cursor a usar o `imgcmd` como ferramenta nativa dentro do repositório.

## 🚀 Instalação

Instale globalmente para deixar o comando disponível em qualquer pasta do sistema:

```bash
npm install -g imgcmd
```

Depois disso, o comando `imgcmd` fica acessível globalmente no terminal.

## ⚙️ Configuração

O `imgcmd` usa sua própria chave do Google Gemini. Você pode configurar isso por variável de ambiente do sistema ou com um arquivo `.env` na raiz do projeto.

```bash
export GEMINI_API_KEY="sua_chave_do_google_aqui"
```

Opcionalmente, você também pode definir um modelo padrão:

```bash
export GEMINI_MODEL="gemini-3.1-flash-image-preview"
```

## 🤖 Agentic Tooling

O grande diferencial desta versão é permitir que seu editor entenda que imagens devem ser geradas pelo CLI, e não por código improvisado no chat.

Com isso, o **Copilot** e o **Cursor** podem ser instruídos a abrir o terminal e usar o `imgcmd` quando o usuário pedir uma imagem dentro do projeto.

## 🧭 Guia Passo a Passo para IA

### Opção A: Configuração Automática

Use um dos comandos abaixo para criar as regras automaticamente no projeto:

```bash
imgcmd -c vscode
imgcmd -c cursor
```

Arquivos gerados:

- VS Code: `.github/copilot-instructions.md`
- Cursor: `.cursor/rules/imgcmd.mdc`

### Opção B: Configuração Manual

Se preferir fazer manualmente, crie o arquivo no caminho correspondente:

- VS Code: `.github/copilot-instructions.md`
- Cursor: `.cursor/rules/imgcmd.mdc`

Depois cole este template de regras:

```md
# Regras para Geração de Imagens
Ao receber um pedido de imagem, NÃO gere código (SVG/Base64).
Use sempre o CLI instalado no sistema via terminal:
`imgcmd "prompt detalhado" --dir <pasta_de_destino>`
```

No Cursor, o arquivo `.cursor/rules/imgcmd.mdc` deve incluir este frontmatter no topo:

```yaml
---
description: Regras para geração de imagens via CLI imgcmd
globs: "*"
---
```

## 💻 Uso Atualizado

### Uso básico

```bash
imgcmd "Um ícone minimalista de foguete, fundo transparente, flat design"
```

### Organizando a saída em pastas

```bash
imgcmd "Logo para tela de login em estilo clean" --dir assets/img
```

### Seleção rápida de modelo

```bash
imgcmd "Mockup de dashboard comercial moderno" --3.1
```

### Flexibilidade total com modelo específico

```bash
imgcmd "Mascote 3D para campanha de vendas" -m <modelo_especifico>
```

## 🧩 Flags disponíveis

- `--2.5`: usa `gemini-2.5-flash-image`
- `--3.1`: usa `gemini-3.1-flash-image-preview`
- `-m`, `--model <nome>`: define um modelo exato
- `-d`, `--dir <pasta>`: salva a imagem no diretório informado
- `-c`, `--create-rule <ide>`: cria regras para IA no projeto (`vscode` ou `cursor`)
- `-h`, `--help`: mostra o menu de ajuda

Precedência de modelo:

1. `-m` ou `--model`
2. `--2.5` ou `--3.1`
3. `GEMINI_MODEL`
4. fallback padrão interno do CLI

## 🛠️ Tecnologias

- Node.js
- Google Generative AI SDK
- dotenv
- ora

## 🤝 Como contribuir

Contribuições são bem-vindas. Se você encontrou um bug, identificou um problema de UX no CLI ou quer sugerir novos fluxos de Agentic Tooling, abra uma issue ou envie um pull request.

## Sobre os Criadores

O **imgcmd** é uma ferramenta gratuita mantida pela equipe da **smoonb.com**.

Se você gostou da proposta e quer conhecer a plataforma por trás do projeto, visite a Smoonb e descubra a solução completa para produtividade comercial, automação e operação com IA.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
