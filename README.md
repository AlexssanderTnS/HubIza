# Iza Space ✿

Hub pessoal e profissional criado para a Izadora, social media do IBAP-RJ.

A proposta mistura organização de conteúdo, campanhas, métricas, tarefas, atalhos e vida pessoal em uma interface leve, criativa e girly.

## O que já funciona

- **Home** com resumo dinâmico de tarefas, conteúdos, aprovações, agenda e ideias.
- **Content Studio** com cadastro, edição, exclusão, busca, filtros, status, data, link e observações para cada conteúdo.
- **Projects** com cadastro, edição, exclusão, prazo e progresso.
- **Idea Garden** com criação e exclusão de ideias.
- **Analytics** com métricas manuais, histórico de snapshots e persistência local.
- **Planner** com tarefas por categoria, prioridade, data, conclusão, edição e exclusão.
- **Links** com atalhos personalizáveis para Canva, Drive, Instagram e outras ferramentas.
- **My Space** com brain dump e lista pessoal.
- **Personalização** de nome, apelido, cargo, bio, lembretes, frases e foto de perfil.
- **Owner Lock** com PIN criado pela própria Izadora e hash derivado via Web Crypto API.

## Persistência

A versão atual usa `localStorage` para salvar dados no navegador. A foto de perfil é redimensionada antes de ser armazenada para reduzir consumo de espaço.

## Sobre o login

O Owner Lock atual é uma camada de privacidade **local**, adequada para bloquear o hub no mesmo navegador/dispositivo. O PIN não é salvo em texto puro: um hash é derivado com PBKDF2 e SHA-256 usando a Web Crypto API.

**Importante:** como o projeto ainda é uma aplicação puramente front-end, esse mecanismo não substitui autenticação real de servidor. Se o site for publicado em uma URL pública e precisar ser acessível exclusivamente pela Izadora em múltiplos dispositivos, a próxima etapa recomendada é conectar um serviço de autenticação e banco de dados, como Supabase, Firebase ou backend próprio.

## Instagram / Meta

As métricas estão editáveis manualmente por enquanto. Isso mantém o painel útil sem depender da integração externa. Uma futura integração pode utilizar a API oficial da Meta para contas profissionais compatíveis, respeitando permissões e requisitos da plataforma.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- Web Crypto API
- localStorage / sessionStorage

## Como executar

Abra `index.html` diretamente no navegador ou use uma extensão como Live Server.

## Estrutura

```text
HubIza/
├── index.html
├── styles.css
├── enhancements.css
├── script.js
└── README.md
```

## Próximas evoluções sugeridas

1. Autenticação real de usuário único.
2. Banco de dados em nuvem para sincronização entre dispositivos.
3. Upload de imagens e anexos para conteúdos e projetos.
4. Integração oficial com Meta/Instagram quando definida a conta profissional e as permissões disponíveis.
5. Exportação/importação de backup do hub.
