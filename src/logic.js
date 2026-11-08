// Regras do jogo da velha. O tabuleiro e um texto de 9 posicoes:
// 'X', 'O' ou '-' (casa vazia), lido da esquerda para a direita, de cima para baixo.

export const VAZIO = '-'

export const LINHAS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

// Devolve 'X', 'O' ou null, e a linha vencedora para destacar no tabuleiro.
export function calcularVencedor(tabuleiro) {
  for (const linha of LINHAS) {
    const [a, b, c] = linha
    const marca = tabuleiro[a]
    if (marca !== VAZIO && marca === tabuleiro[b] && marca === tabuleiro[c]) {
      return { marca, linha }
    }
  }
  return null
}

export function tabuleiroCheio(tabuleiro) {
  return !tabuleiro.includes(VAZIO)
}

// Formato exato do que e enviado ao Supabase na funcao "jogar".
export function montarPayloadJogada(partidaId, posicao) {
  return { p_partida: partidaId, p_posicao: posicao }
}

// Qual marca (X ou O) o usuario usa nesta partida; null se nao participa.
export function minhaMarca(partida, usuarioId) {
  if (partida.jogador_x === usuarioId) return 'X'
  if (partida.jogador_o === usuarioId) return 'O'
  return null
}

export function podeJogar(partida, usuarioId, posicao) {
  if (partida.status !== 'em_andamento') return false
  if (minhaMarca(partida, usuarioId) !== partida.vez) return false
  return partida.tabuleiro[posicao] === VAZIO
}

// Texto de status exibido acima do tabuleiro.
export function textoStatus(partida, usuarioId) {
  const marca = minhaMarca(partida, usuarioId)
  if (partida.status === 'aguardando') {
    return 'Aguardando o adversário entrar na sala'
  }
  if (partida.status === 'finalizada') {
    if (!partida.vencedor) return 'Empate'
    return partida.vencedor === usuarioId ? 'Você venceu' : 'Você perdeu'
  }
  return partida.vez === marca ? `Sua vez (${marca})` : `Vez do adversário (${partida.vez})`
}
