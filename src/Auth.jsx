import { useState } from 'react'
import { supabase } from './supabaseClient.js'

export default function Auth() {
  const [modo, setModo] = useState('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [info, setInfo] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setInfo('')
    setCarregando(true)

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) setErro(traduzir(error.message))
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome: nome.trim() } },
      })
      if (error) {
        setErro(traduzir(error.message))
      } else if (!data.session) {
        setInfo('Conta criada. Abra o e-mail de confirmação e depois entre.')
        setModo('entrar')
      }
    }
    setCarregando(false)
  }

  return (
    <section className="cartao login">
      <h1>Jogo da Velha Online v2</h1>
      <p className="aviso">Crie uma conta, abra uma sala e jogue contra outra pessoa em tempo real.</p>

      <div className="abas" role="tablist">
        <button
          role="tab"
          aria-selected={modo === 'entrar'}
          className={modo === 'entrar' ? 'aba ativa' : 'aba'}
          onClick={() => setModo('entrar')}
          type="button"
        >
          Entrar
        </button>
        <button
          role="tab"
          aria-selected={modo === 'cadastrar'}
          className={modo === 'cadastrar' ? 'aba ativa' : 'aba'}
          onClick={() => setModo('cadastrar')}
          type="button"
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={enviar}>
        {modo === 'cadastrar' && (
          <label>
            Nome no jogo
            <input value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={20} />
          </label>
        )}
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        {info && <p className="info">{info}</p>}
        <button className="botao" disabled={carregando}>
          {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </section>
  )
}

function traduzir(mensagem) {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (mensagem.includes('already registered')) return 'Este e-mail já tem conta. Use a aba Entrar.'
  if (mensagem.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (mensagem.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  return mensagem
}
