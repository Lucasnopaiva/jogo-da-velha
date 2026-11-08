import { describe, it, expect } from 'vitest'
import {
  calcularVencedor,
  tabuleiroCheio,
  montarPayloadJogada,
  minhaMarca,
  podeJogar,
  textoStatus,
} from './logic.js'

const partida = (extra = {}) => ({
  id: 'p1',
  jogador_x: 'u1',
  jogador_o: 'u2',
  tabuleiro: '---------',
  vez: 'X',
  status: 'em_andamento',
  vencedor: null,
  ...extra,
})

describe('calcularVencedor', () => {
  it('nao encontra vencedor no tabuleiro vazio', () => {
    expect(calcularVencedor('---------')).toBeNull()
  })

  it('detecta vitoria em linha, coluna e diagonal', () => {
    expect(calcularVencedor('XXX------')).toEqual({ marca: 'X', linha: [0, 1, 2] })
    expect(calcularVencedor('O--O--O--')).toEqual({ marca: 'O', linha: [0, 3, 6] })
    expect(calcularVencedor('X---X---X')).toEqual({ marca: 'X', linha: [0, 4, 8] })
    expect(calcularVencedor('--O-O-O--')).toEqual({ marca: 'O', linha: [2, 4, 6] })
  })

  it('nao confunde duas marcas iguais com vitoria', () => {
    expect(calcularVencedor('XX-OO----')).toBeNull()
  })
})

describe('tabuleiroCheio', () => {
  it('reconhece tabuleiro cheio (empate) e tabuleiro com casas livres', () => {
    expect(tabuleiroCheio('XOXXOOOXX')).toBe(true)
    expect(calcularVencedor('XOXXOOOXX')).toBeNull()
    expect(tabuleiroCheio('XOXXOO-XX')).toBe(false)
  })
})

describe('montarPayloadJogada', () => {
  it('monta o payload no formato esperado pela funcao jogar do Supabase', () => {
    expect(montarPayloadJogada('abc', 4)).toEqual({ p_partida: 'abc', p_posicao: 4 })
  })
})

describe('regras de turno', () => {
  it('descobre a marca de cada jogador', () => {
    expect(minhaMarca(partida(), 'u1')).toBe('X')
    expect(minhaMarca(partida(), 'u2')).toBe('O')
    expect(minhaMarca(partida(), 'u3')).toBeNull()
  })

  it('so permite jogar na propria vez e em casa livre', () => {
    expect(podeJogar(partida(), 'u1', 0)).toBe(true)
    expect(podeJogar(partida(), 'u2', 0)).toBe(false)
    expect(podeJogar(partida({ tabuleiro: 'X--------', vez: 'O' }), 'u2', 0)).toBe(false)
    expect(podeJogar(partida({ status: 'finalizada' }), 'u1', 0)).toBe(false)
  })

  it('descreve o status da partida para cada jogador', () => {
    expect(textoStatus(partida(), 'u1')).toBe('Sua vez (X)')
    expect(textoStatus(partida(), 'u2')).toBe('Vez do adversário (X)')
    expect(textoStatus(partida({ status: 'finalizada', vencedor: 'u1' }), 'u1')).toBe('Você venceu')
    expect(textoStatus(partida({ status: 'finalizada', vencedor: 'u1' }), 'u2')).toBe('Você perdeu')
    expect(textoStatus(partida({ status: 'finalizada' }), 'u1')).toBe('Empate')
    expect(textoStatus(partida({ status: 'aguardando', jogador_o: null }), 'u1')).toBe(
      'Aguardando o adversário entrar na sala',
    )
  })
})
