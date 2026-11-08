import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import Auth from './Auth.jsx'
import Lobby from './Lobby.jsx'
import Game from './Game.jsx'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [partidaId, setPartidaId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao)
      if (!novaSessao) setPartidaId(null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return <main className="pagina"><p className="aviso">Carregando…</p></main>
  }

  if (!session) {
    return (
      <main className="pagina">
        <Auth />
      </main>
    )
  }

  const usuario = session.user

  return (
    <main className="pagina">
      <header className="topo">
        <h1>Jogo da Velha</h1>
        <button className="botao secundario" onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </header>
      {partidaId ? (
        <Game partidaId={partidaId} usuario={usuario} onSair={() => setPartidaId(null)} />
      ) : (
        <Lobby usuario={usuario} onEntrar={setPartidaId} />
      )}
    </main>
  )
}
