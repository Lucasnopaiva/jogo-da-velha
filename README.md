# Jogo da Velha Online

Mini-game multiplayer em tempo real para o trabalho final de Desenvolvimento de Software em Nuvem (Unifor).

| Camada | Tecnologia |
| --- | --- |
| Frontend | React + Vite |
| Backend (BaaS) | Supabase: login, banco PostgreSQL, Realtime e regras de segurança (RLS) |
| Testes | Vitest |
| Contêiner | Docker (build do Vite servido por nginx) |
| CI/CD | GitHub Actions: build, teste, imagem no GitHub Container Registry e webhook do Portainer |
| Hospedagem | VPS na Oracle Cloud gerenciada pelo Portainer |

## Como rodar no computador

```
npm install
npm run dev
npm test
```

## Fluxo de branches

- `main`: produção. Cada push que passa nos testes atualiza o jogo no ar.
- `dev`: integração. Build e testes rodam em todo push e pull request.
- `feature/*`: uma branch por tarefa, que volta para `dev` por pull request.

## Banco de dados (Supabase)

Tabelas `perfis` e `partidas`, com RLS ligado. Ninguém altera o tabuleiro direto: as jogadas passam pelas funções `criar_partida`, `entrar_na_partida` e `jogar`, que validam o usuário, a vez e a casa livre.
