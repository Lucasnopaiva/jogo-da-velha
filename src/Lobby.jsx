import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

export default function Lobby({ usuario, onEntrar }) {
  const [perfil, setPerfil] = useState(null)
  const [placar, setPlacar] = useState([])
  const [abertas, setAbertas] = useState([])
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const carregar = useCallback(async () => {
    const [meu, top, minhas] = await Promise.all([
      supabase.from('perfis').select('nome, vitorias').eq('id', usuario.id).maybeSingle(),
      supabase.from('perfis').select('id, nome, vitorias').order('vitorias', { ascending: false }).limit(5),
      supabase
        .from('partidas')
        .select('id, codigo, status')
        .neq('status', 'finalizada')
        .order('criado_em', { ascending: false }),
    ])
    setPerfil(meu.data)
    setPlacar(top.data ?? [])
    setAbertas(minhas.data ?? [])
  }, [usuario.id])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function criarSala() {
    setErro('')
    setOcupado(true)
    const { data, error } = await supabase.rpc('criar_partida')
    setOcupado(false)
    if (error) return setErro(error.message)
    onEntrar(data.id)
  }

  async function entrarNaSala(evento) {
    evento.preventDefault()
    setErro('')
    setOcupado(true)
    const { data, error } = await supabase.rpc('entrar_na_partida', { p_codigo: codigo })
    setOcupado(false)
    if (error) return setErro(error.message)
    onEntrar(data.id)
  }

  return (
    <div className="lobby">
      <section className="cartao">
        <h2>Olá, {perfil?.nome ?? '…'}</h2>
        <p className="aviso">
          Suas vitórias: <strong>{perfil?.vitorias ?? 0}</strong>
        </p>

        <button className="botao" onClick={criarSala} disabled={ocupado}>
          Criar sala
        </button>

        <p className="separador">ou entre numa sala existente</p>

        <form onSubmit={entrarNaSala} className="linha">
          <label className="grande">
            Código da sala
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              maxLength={5}
              required
              autoCapitalize="characters"
            />
          </label>
          <button className="botao secundario" disabled={ocupado}>
            Entrar na sala
          </button>
        </form>

        {erro && <p className="erro" role="alert">{erro}</p>}
      </section>

      {abertas.length > 0 && (
        <section className="cartao">
          <h2>Partidas em andamento</h2>
          <ul className="lista">
            {abertas.map((p) => (
              <li key={p.id}>
                <span>
                  Sala {p.codigo}
                  <small>{p.status === 'aguardando' ? ' · aguardando adversário' : ' · em andamento'}</small>
                </span>
                <button className="botao secundario pequeno" onClick={() => onEntrar(p.id)}>
                  Continuar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="cartao">
        <h2>Placar</h2>
        {placar.length === 0 ? (
          <p className="aviso">Ninguém venceu ainda. Jogue a primeira partida.</p>
        ) : (
          <ol className="lista">
            {placar.map((p) => (
              <li key={p.id}>
                <span>{p.nome}</span>
                <strong>{p.vitorias}</strong>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
