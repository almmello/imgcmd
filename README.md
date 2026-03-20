# 🖼️ imgcmd

> O gerador de imagens via terminal seguro, definitivo e focado no desenvolvedor.

Gerar imagens diretamente pelo chat de IA do seu editor de código (como o GitHub Copilot) frequentemente resulta em arquivos corrompidos ou exige a instalação de extensões de terceiros duvidosas.

O **imgcmd** resolve isso. Ele é uma ferramenta de linha de comando (CLI) construída para desenvolvedores que desejam gerar assets visuais sem sair do terminal, com **segurança total** (Zero Trust) e usando exclusivamente os SDKs oficiais do Google (Gemini) e OpenAI (DALL-E).

## ✨ Funcionalidades

* **Segurança em 1º Lugar:** Suas chaves de API nunca saem da sua máquina. O código se comunica apenas com os servidores oficiais da OpenAI e do Google.
* **Sem Arquivos Corrompidos:** Baixa o binário real da imagem e salva um arquivo `.png` perfeito direto na sua pasta atual.
* **Rápido e Direto:** Sem interfaces complexas. Digite o comando e receba a imagem.
* **Agnóstico de Editor:** Funciona perfeitamente no terminal do VS Code, Cursor, WebStorm ou no seu terminal nativo do sistema operacional.

## 🚀 Instalação

Você pode rodar o pacote diretamente via `npx` sem precisar instalar nada permanentemente, ou instalá-lo globalmente na sua máquina:

```bash
# Para instalar globalmente (recomendado para uso frequente)
npm install -g imgcmd
```

## ⚙️ Configuração

Como o **imgcmd** foca em segurança, ele não possui um servidor intermediário. Ele usa as suas próprias chaves de API, garantindo que você tenha controle total sobre os custos e a privacidade.

Defina a sua chave de API nas variáveis de ambiente do seu sistema ou crie um arquivo `.env` na raiz do seu projeto:

```bash
# Para usar os modelos do Google (ex: Gemini Flash Image / Nano Banana)
export GEMINI_API_KEY="sua_chave_do_google_aqui"

# Para usar os modelos da OpenAI (ex: DALL-E 3)
export OPENAI_API_KEY="sua_chave_da_openai_aqui"
```

## 💻 Como Usar

A sintaxe é simples e desenhada para não interromper o seu fluxo de trabalho:

```bash
# Uso básico (usará o modelo padrão configurado)
imgcmd "Um ícone minimalista de um foguete, fundo transparente, flat design"

# Especificando o modelo ou provedor (exemplo futuro)
imgcmd "Logo para um app de finanças" --provider google
```

A imagem gerada será salva automaticamente no diretório onde você executou o comando (ex: `imagem_1710000000.png`).

## 🛠️ Tecnologias Utilizadas

  * [Node.js](https://nodejs.org/)
  * [Google Gen AI SDK](https://www.npmjs.com/package/@google/generative-ai)
  * [OpenAI Node SDK](https://www.npmjs.com/package/openai)

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Se você encontrou um bug ou tem uma ideia para uma nova funcionalidade (como suporte a novos modelos ou flags de redimensionamento), sinta-se à vontade para abrir uma *Issue* ou enviar um *Pull Request*.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](https://www.google.com/search?q=LICENSE) para mais detalhes.
