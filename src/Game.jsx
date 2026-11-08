import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import {
  VAZIO,
  calcularVencedor,
  minhaMarca,
  montarPayloadJogada,
  podeJogar,
  textoStatus,
} from './logic.js'

export default function Game({ partidaId, usuario, onSair }) {
  const [partida, setPartida] = useState(null)
  const [nomes, setNomes] = useState({})
  const [erro, setErro] = useState('')

  // Carrega a partida e escuta as mudancas em tempo real (Supabase Realtime).
  useEffect(() => {
    let ativo = true

    async function buscar() {
      const { data } = await supabase.from('partidas').select('*').eq('id', partidaId).maybeSingle()
      if (ativo && data) setPartida(data)
    }
    buscar()

    const canal = supabase
      .channel(`partida-${partidaId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'partidas', filter: `id=eq.${partidaId}` },
        (payload) => ativo && setPartida(payload.new),
      )
      .subscribe((estado) => {
        if (estado === 'SUBSCRIBED') buscar()
      })

    // Reserva: se a conexao em tempo real cair, a tela ainda se atualiza.
    const intervalo = setInterval(buscar, 4000)

    return () => {
      ativo = false
      clearInterval(intervalo)
      supabase.removeChannel(canal)
    }
  }, [partidaId])

  // Busca o nome dos dois jogadores.
  useEffect(() => {
    if (!partida) return
    const ids = [partida.jogador_x, partida.jogador_o].filter(Boolean)
    supabase
      .from('perfis')
      .select('id, nome')
      .in('id', ids)
      .then(({ data }) => {
        if (data) setNomes(Object.fromEntries(data.map((p) => [p.id, p.nome])))
      })
  }, [partida?.jogador_x, partida?.jogador_o])

  async function jogar(posicao) {
    setErro('')
    const { data, error } = await supabase.rpc('jogar', montarPayloadJogada(partidaId, posicao))
    if (error) return setErro(error.message)
    setPartida(data)
  }

  if (!partida) return <p className="aviso">Carregando a partida…</p>

  const resultado = calcularVencedor(partida.tabuleiro)
  const marca = minhaMarca(partida, usuario.id)
  const adversario = marca === 'X' ? partida.jogador_o : partida.jogador_x
  const venceu = partida.status === 'finalizada' && partida.vencedor === usuario.id
  const perdeu = partida.status === 'finalizada' && partida.vencedor && !venceu

  return (
    <section className="cartao partida">
      <div className="cabecalho-partida">
        <div>
          <p className="rotulo">Sala</p>
          <p className="codigo">{partida.codigo}</p>
        </div>
        <button className="botao secundario pequeno" onClick={onSair}>
          Voltar ao lobby
        </button>
      </div>

      <p className="jogadores">
        <span className="marca-x">Você ({marca}) · {nomes[usuario.id] ?? '…'}</span>
        <span className="marca-o">
          {adversario ? `${nomes[adversario] ?? '…'} (${marca === 'X' ? 'O' : 'X'})` : 'Aguardando adversário'}
        </span>
      </p>

      <p className={`status ${venceu ? 'venceu' : ''} ${perdeu ? 'perdeu' : ''}`} aria-live="polite">
        {textoStatus(partida, usuario.id)}
      </p>

      {partida.status === 'aguardando' && (
        <p className="aviso">Passe o código <strong>{partida.codigo}</strong> para a outra pessoa entrar na sala.</p>
      )}

      <div className="tabuleiro" role="grid" aria-label="Tabuleiro do jogo da velha">
        {partida.tabuleiro.split('').map((casa, i) => {
          const destaque = resultado?.linha.includes(i)
          return (
            <button
              key={i}
              role="gridcell"
              className={`casa ${casa === 'X' ? 'x' : ''} ${casa === 'O' ? 'o' : ''} ${destaque ? 'destaque' : ''}`}
              onClick={() => jogar(i)}
              disabled={!podeJogar(partida, usuario.id, i)}
              aria-label={`Casa ${i + 1}: ${casa === VAZIO ? 'vazia' : casa}`}
            >
              {casa === VAZIO ? '' : casa}
            </button>
          )
        })}
      </div>

      {erro && <p className="erro" role="alert">{erro}</p>}

      {partida.status === 'finalizada' && (
        <button className="botao" onClick={onSair}>
          Jogar de novo
        </button>
      )}
    </section>
  )
}
