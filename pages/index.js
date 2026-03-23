// v3 - localStorage + imagen obligatoria
import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { SERVICES, DEMO_USERS, DEMO_ORDERS, DEMO_OFFERS } from '../lib/data'

const initialOrders = DEMO_ORDERS.map(o => ({ ...o, service: SERVICES[0] }))

function loadState(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function saveState(key, value) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function parseBubble(content) {
  const parts = content.split(/(```json[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```json')) {
      const json = part.replace('```json\n', '').replace(/```$/, '')
      let obj = null
      try { obj = JSON.parse(json) } catch (e) {}
      if (!obj) return null
      return (
        <div key={i} className="chat-brief">
          <div className="chat-brief-label">Brief Técnico</div>
          {obj.titulo && <div className="chat-brief-title">{obj.titulo}</div>}
          {obj.especificaciones && Object.entries(obj.especificaciones)
            .filter(([k, v]) => v && k !== 'archivo_disponible')
            .map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '6px', marginBottom: '4px', fontSize: '12px' }}>
                <span style={{ color: '#666', minWidth: '90px', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                <span style={{ color: '#D0CCC8' }}>{String(v)}</span>
              </div>
            ))}
        </div>
      )
    }
    const html = part
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
    return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />
  })
}

function Nav({ user, screen, setScreen, logout }) {
  if (!user) return null
  const links = user.type === 'client'
    ? [{ label: 'Servicios', s: 'services' }, { label: 'Mis Pedidos', s: 'my-orders' }]
    : [{ label: 'Panel Taller', s: 'workshop-dash' }]
  const uname = user.type === 'workshop' ? user.workshopName : user.name
  return (
    <nav className="nav">
      <div className="logo" onClick={() => setScreen(user.type === 'client' ? 'services' : 'workshop-dash')}>
        <div className="logo-mark">F</div>
        <div className="logo-text">Fab<span>Market</span></div>
      </div>
      <div className="nav-right">
        {links.map(l => (
          <button key={l.s} className="btn btn-ghost btn-sm"
            style={{ color: screen === l.s ? '#D97706' : '#888' }}
            onClick={() => setScreen(l.s)}>{l.label}</button>
        ))}
        <div className="nav-user"><strong>{uname}</strong></div>
        <span className={`nbadge ${user.type === 'workshop' ? 'workshop' : ''}`}>
          {user.type === 'workshop' ? 'taller' : 'cliente'}
        </span>
        <button className="btn btn-ghost btn-sm" style={{ color: '#555', fontSize: '11px' }} onClick={logout}>Salir</button>
      </div>
    </nav>
  )
}

function AuthScreen({ users, currentUser, loginAs, setScreen }) {
  return (
    <div className="page">
      <div className="auth-hero">
        <h1>Manufactura a medida,<br /><em>sin intermediarios</em></h1>
        <p>Conectamos clientes con talleres de Lima para hacer realidad tu proyecto.</p>
        <div className="auth-options">
          <div className="auth-option" onClick={() => loginAs(users.find(u => u.type === 'client'))}>
            <div className="icon">👤</div>
            <h3>Ingresar como Cliente</h3>
            <p>Publica tu pedido y recibe ofertas de talleres especializados</p>
          </div>
          <div className="auth-option" onClick={() => setScreen('register-workshop')}>
            <div className="icon">🏭</div>
            <h3>Registrarse como Taller</h3>
            <p>Accede a pedidos de manufactura y haz crecer tu negocio</p>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0', color: '#444', fontSize: '12px' }}>— Usuarios de demostración —</div>
      <div className="demo-box">
        <h4>Cambiar usuario (demo)</h4>
        <div className="demo-users">
          {users.map(u => (
            <button key={u.id} className={`demo-btn ${currentUser?.id === u.id ? 'active' : ''}`} onClick={() => loginAs(u)}>
              {u.type === 'client' ? u.name : u.workshopName}
              <span className="bx">{u.type === 'client' ? 'cliente' : 'taller'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function RegisterScreen({ setScreen, onRegister }) {
  const [form, setForm] = useState({ name: '', shop: '', wa: '' })
  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  return (
    <div className="page page-sm">
      <div className="register-box">
        <h2>Registrar Taller</h2>
        <p>Completa tus datos para acceder a los pedidos de manufactura.</p>
        <div className="form-stack">
          <div className="input-group">
            <label className="input-label">Nombre completo del responsable</label>
            <input className="input" placeholder="Ej: Roberto Silva Pérez" value={form.name} onChange={upd('name')} />
          </div>
          <div className="input-group">
            <label className="input-label">Nombre del taller</label>
            <input className="input" placeholder="Ej: TechFab Lima" value={form.shop} onChange={upd('shop')} />
          </div>
          <div className="input-group">
            <label className="input-label">Número de WhatsApp</label>
            <input className="input" placeholder="Ej: 51987654321" value={form.wa} onChange={upd('wa')} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <button className="btn btn-ghost" onClick={() => setScreen('auth')}>← Volver</button>
            <button className="btn btn-primary btn-lg" onClick={() => onRegister(form)} disabled={!form.name || !form.shop || !form.wa}>
              Registrar Taller →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicesScreen({ onSelect }) {
  return (
    <div className="page">
      <div className="page-header">
        <h2>¿Qué necesitas fabricar?</h2>
        <p>Selecciona el servicio y el asistente te preparará el pedido.</p>
      </div>
      <div className="services-grid">
        {SERVICES.map(s => (
          <div key={s.id} className="service-card" style={{ '--accent': s.color }} onClick={() => onSelect(s)}>
            <div className="service-icon">{s.icon}</div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <div className="service-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatScreen({ service, onPublish }) {
  const greetings = {
    '3d': '¡Hola! Soy tu asistente para **Impresión 3D**. Puedes escribirme o subir una foto/imagen de la pieza.\n\n¿Qué tipo de pieza necesitas imprimir?',
    'cnc': '¡Hola! Soy tu asistente para **CNC Mecanizado**. Puedes describirme la pieza o subir un plano/imagen.\n\n¿Qué pieza necesitas mecanizar?',
    'laser': '¡Hola! Soy tu asistente para **Corte y Grabado Láser**. Puedes subir tu diseño o imagen de referencia.\n\n¿Qué necesitas cortar o grabar?',
    'injection': '¡Hola! Soy tu asistente para **Inyección Plástica**. Puedes subir una imagen de referencia o plano.\n\n¿Qué pieza plástica necesitas producir?',
  }
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: greetings[service.id] || '¡Hola!' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)
  const [pendingImages, setPendingImages] = useState([])
  const [allImages, setAllImages] = useState([]) // todas las imágenes subidas en la sesión
  const endRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPendingImages(prev => [...prev, ev.target.result])
        setAllImages(prev => [...prev, ev.target.result])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeImage(idx) {
    setPendingImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function send() {
    const txt = input.trim()
    if ((!txt && pendingImages.length === 0) || loading) return
    const userMsg = {
      role: 'user',
      content: txt || '(imagen adjunta)',
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs)
    setInput('')
    setPendingImages([])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, serviceId: service.id }),
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Error al obtener respuesta.'
      const all = [...newMsgs, { role: 'assistant', content: reply }]
      setMsgs(all)
      const jm = reply.match(/```json\n([\s\S]*?)```/)
      if (jm) { try { setDraft(JSON.parse(jm[1])) } catch (e) {} }
    } catch (e) {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }])
    }
    setLoading(false)
  }

  const steps = [
    { label: 'Tipo de servicio', done: true },
    { label: 'Descripción del proyecto', done: msgs.length > 2 },
    { label: 'Especificaciones técnicas', done: msgs.length > 6 },
    { label: 'Brief completo', done: !!draft },
  ]
  const doneCnt = steps.filter(s => s.done).length
  const canPublish = !!draft && allImages.length > 0

  return (
    <div className="page" style={{ paddingTop: '20px' }}>
      <div className="chat-layout">
        <div className="chat-main">
          <div className="chat-header">
            <span className="chat-badge" style={{ color: service.color, borderColor: service.colorDim, background: service.colorBg }}>
              {service.name}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Asistente de Pedidos</span>
          </div>
          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
                <div className="msg-bubble">
                  {m.images && m.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: m.content && m.content !== '(imagen adjunta)' ? '8px' : '0' }}>
                      {m.images.map((img, idx) => (
                        <img key={idx} src={img} alt="adjunto" style={{ maxWidth: '180px', maxHeight: '140px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #3A2F00' }} />
                      ))}
                    </div>
                  )}
                  {m.content && m.content !== '(imagen adjunta)' && (
                    m.role === 'user' ? m.content : parseBubble(m.content)
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg assistant">
                <div className="msg-bubble">
                  <div className="typing">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {pendingImages.length > 0 && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid #1E1E1E', display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#0D0D0D' }}>
              {pendingImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={img} alt="preview" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #3A2F00' }} />
                  <button onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', background: '#EF4444', border: 'none', borderRadius: '50%', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
            <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm" title="Adjuntar imagen"
              style={{ padding: '8px', fontSize: '18px', flexShrink: 0, border: '1px solid #333', borderRadius: '7px' }}>
              📎
            </button>
            <textarea
              placeholder="Escribe tu respuesta o adjunta una imagen..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={1}
            />
            <button className="btn btn-primary" onClick={send} disabled={(!input.trim() && pendingImages.length === 0) || loading}>
              Enviar
            </button>
          </div>
        </div>

        <div className="sidebar">
          <div className="progress-box">
            <h4>Progreso del Brief</h4>
            <div className="steps">
              {steps.map((st, i) => (
                <div key={i} className={`step ${st.done ? 'done' : i === doneCnt ? 'active' : ''}`}>
                  <div className="step-icon">{st.done ? '✓' : i + 1}</div>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#111', border: `1px solid ${allImages.length > 0 ? '#065F46' : '#1E1E1E'}`, borderRadius: '9px', padding: '14px', fontSize: '12px', color: '#666', lineHeight: 1.6, transition: 'border-color 0.3s' }}>
            <div style={{ color: allImages.length > 0 ? '#34D399' : '#D97706', marginBottom: '6px' }}>
              {allImages.length > 0 ? `✅ ${allImages.length} imagen(es) adjunta(s)` : '📎 Imagen requerida'}
            </div>
            {allImages.length > 0
              ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {allImages.map((img, i) => <img key={i} src={img} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />)}
                </div>
              : 'Sube al menos una foto o imagen del pedido para poder publicarlo.'
            }
          </div>

          {draft ? (
            <div className="brief-box">
              <h4>Brief Técnico</h4>
              <div className="brief-title">{draft.titulo}</div>
              {draft.especificaciones && Object.entries(draft.especificaciones)
                .filter(([k, v]) => v && k !== 'archivo_disponible')
                .map(([k, v]) => (
                  <div key={k} className="brief-row">
                    <span className="brief-label">{k.replace(/_/g, ' ')}</span>
                    <span className="brief-value">{String(v)}</span>
                  </div>
                ))}
              {!canPublish && (
                <div style={{ fontSize: '11px', color: '#EF4444', background: '#1A0808', border: '1px solid #3A0808', borderRadius: '5px', padding: '8px', marginTop: '10px' }}>
                  ⚠️ Debes subir al menos una imagen para publicar
                </div>
              )}
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px', opacity: canPublish ? 1 : 0.4 }}
                onClick={() => canPublish && onPublish(draft, service, allImages)}
                disabled={!canPublish}>
                {canPublish ? 'Publicar Pedido →' : 'Sube una imagen primero'}
              </button>
            </div>
          ) : (
            <div className="hint-box">
              <div style={{ marginBottom: '6px', color: '#888' }}>💡 Cómo funciona</div>
              Responde las preguntas y sube una imagen del pedido. Los talleres la verán al cotizar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MyOrdersScreen({ orders, offers, user, onAccept }) {
  const [expanded, setExpanded] = useState(null)
  const mine = orders.filter(o => o.clientId === user.id)
  return (
    <div className="page">
      <div className="page-header">
        <h2>Mis Pedidos</h2>
        <p>Revisa las ofertas de los talleres para cada pedido.</p>
      </div>
      {mine.length === 0 ? (
        <div className="empty-state"><h3>Sin pedidos aún</h3><p>Ve a Servicios para crear tu primer pedido.</p></div>
      ) : (
        <div className="order-list">
          {mine.map(ord => {
            const ordOffers = offers.filter(o => o.orderId === ord.id)
            const exp = expanded === ord.id
            const stBadge = ord.status === 'open' ? <span className="badge badge-open">● Abierto</span>
              : ord.status === 'in-progress' ? <span className="badge badge-progress">● En proceso</span>
              : <span className="badge badge-accepted">● Completado</span>
            return (
              <div key={ord.id} className="order-card">
                <div className="order-header" onClick={() => setExpanded(exp ? null : ord.id)}>
                  <div>
                    <div className="order-title">{ord.summary?.titulo}</div>
                    <div className="order-meta">
                      <span className="badge badge-service">{ord.service?.name}</span>
                      {stBadge}
                      <span className="meta-date">{fmtDate(ord.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', color: '#888' }}><strong style={{ color: '#D97706' }}>{ordOffers.length}</strong> ofertas</div>
                    <div style={{ color: '#555', fontSize: '11px', marginTop: '3px' }}>{exp ? '▲' : '▼'}</div>
                  </div>
                </div>
                {exp && (
                  <div className="order-body">
                    {/* Mostrar imágenes del pedido */}
                    {ord.images && ord.images.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '8px' }}>Imágenes del pedido</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {ord.images.map((img, i) => (
                            <img key={i} src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #2A2A2A' }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {ord.summary?.descripcion_tecnica && <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>{ord.summary.descripcion_tecnica}</p>}
                    {ord.summary?.especificaciones && (
                      <div className="specs-grid">
                        {Object.entries(ord.summary.especificaciones)
                          .filter(([k, v]) => v && k !== 'archivo_disponible')
                          .map(([k, v]) => (
                            <div key={k} className="spec-block">
                              <div className="spec-label">{k.replace(/_/g, ' ')}</div>
                              <div className="spec-value">{String(v)}</div>
                            </div>
                          ))}
                      </div>
                    )}
                    <div>
                      <div className="offers-title">Ofertas de talleres ({ordOffers.length})</div>
                      {ordOffers.length === 0 ? (
                        <div style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '16px', background: '#0D0D0D', borderRadius: '7px' }}>Aún no hay ofertas.</div>
                      ) : (
                        <div className="offer-list">
                          {ordOffers.sort((a, b) => a.price - b.price).map(off => (
                            <div key={off.id} className={`offer-card ${off.status}`}>
                              <div style={{ flex: 1 }}>
                                <div className="offer-workshop-name">{off.workshopName}</div>
                                <div className="offer-location">📍 {off.location}</div>
                                {off.message && <div className="offer-message">"{off.message}"</div>}
                                {off.status === 'accepted' && <div className="offer-wa">✅ Aceptada · WhatsApp: +{off.workshopWhatsapp}</div>}
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div className="offer-price">S/ {off.price}</div>
                                <div className="offer-price-sub">soles</div>
                                <div className="offer-delivery">🕐 {off.deliveryDays} días</div>
                                {off.status === 'pending' && ord.status === 'open' && (
                                  <button className="btn btn-success btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => onAccept(off)}>
                                    Aceptar
                                  </button>
                                )}
                                {off.status === 'accepted' && (
                                  <div className="commission-note">Comisión:<br /><strong>S/ {(off.price * 0.05).toFixed(2)}</strong> (5%)</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function WorkshopDash({ orders, offers, commissions, user, onSubmitOffer, onMarkPaid }) {
  const [tab, setTab] = useState('orders')
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(null)
  const [form, setForm] = useState({ price: '', days: '', msg: '' })
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const open = orders.filter(o => o.status === 'open')
  const myOff = offers.filter(o => o.workshopId === user.id)
  const myComm = commissions.filter(c => c.workshopId === user.id)

  return (
    <div className="page">
      <div className="page-header">
        <h2>Panel del Taller</h2>
        <p>Revisa pedidos, tus ofertas y comisiones.</p>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Pedidos ({open.length})</button>
        <button className={`tab ${tab === 'my-offers' ? 'active' : ''}`} onClick={() => setTab('my-offers')}>Mis Ofertas ({myOff.length})</button>
        <button className={`tab ${tab === 'commissions' ? 'active' : ''}`} onClick={() => setTab('commissions')}>Comisiones ({myComm.length})</button>
      </div>

      {tab === 'orders' && (
        open.length === 0 ? <div className="empty-state"><h3>Sin pedidos disponibles</h3></div> :
        <div className="order-list">
          {open.map(ord => {
            const exp = expanded === ord.id
            const already = myOff.some(o => o.orderId === ord.id)
            return (
              <div key={ord.id} className="order-card">
                <div className="order-header" onClick={() => setExpanded(exp ? null : ord.id)}>
                  <div>
                    <div className="order-title">{ord.summary?.titulo}</div>
                    <div className="order-meta">
                      <span className="badge badge-service">{ord.service?.name}</span>
                      <span className="badge badge-open">● Abierto</span>
                      <span className="meta-date">Cliente: {ord.clientName}</span>
                    </div>
                  </div>
                  <div style={{ color: '#555', fontSize: '11px' }}>{exp ? '▲' : '▼'}</div>
                </div>
                {exp && (
                  <div className="order-body">
                    {/* Imágenes visibles para el taller */}
                    {ord.images && ord.images.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: '8px' }}>Imágenes del pedido</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                          {ord.images.map((img, i) => (
                            <img key={i} src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #2A2A2A' }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {ord.summary?.descripcion_tecnica && <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>{ord.summary.descripcion_tecnica}</p>}
                    {ord.summary?.especificaciones && (
                      <div className="specs-grid">
                        {Object.entries(ord.summary.especificaciones)
                          .filter(([k, v]) => v && k !== 'archivo_disponible')
                          .map(([k, v]) => (
                            <div key={k} className="spec-block">
                              <div className="spec-label">{k.replace(/_/g, ' ')}</div>
                              <div className="spec-value">{String(v)}</div>
                            </div>
                          ))}
                      </div>
                    )}
                    {already ? (
                      <div style={{ background: '#0A1A0A', border: '1px solid #1A3A1A', borderRadius: '7px', padding: '12px', fontSize: '13px', color: '#34D399' }}>
                        ✅ Ya enviaste una oferta para este pedido.
                      </div>
                    ) : showForm === ord.id ? (
                      <div className="offer-form">
                        <h4>Enviar Oferta</h4>
                        <div className="offer-form-grid">
                          <div className="input-group">
                            <label className="input-label">Precio (S/)</label>
                            <input type="number" className="input" placeholder="Ej: 120" value={form.price} onChange={upd('price')} />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Días de entrega</label>
                            <input type="number" className="input" placeholder="Ej: 5" value={form.days} onChange={upd('days')} />
                          </div>
                        </div>
                        <div className="input-group" style={{ marginBottom: '12px' }}>
                          <label className="input-label">Mensaje (opcional)</label>
                          <textarea className="input" placeholder="Describe tus equipos, garantías..." rows={3} value={form.msg} onChange={upd('msg')} />
                        </div>
                        {form.price && (
                          <div className="commission-hint">
                            💡 Si el cliente acepta, pagarás <strong style={{ color: '#D97706' }}>S/ {(parseFloat(form.price || 0) * 0.05).toFixed(2)}</strong> de comisión (5%)
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost" onClick={() => setShowForm(null)}>Cancelar</button>
                          <button className="btn btn-primary" onClick={() => { onSubmitOffer(ord.id, form, user); setShowForm(null); setForm({ price: '', days: '', msg: '' }) }} disabled={!form.price || !form.days}>
                            Enviar Oferta →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-primary" onClick={() => setShowForm(ord.id)}>Hacer Oferta →</button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'my-offers' && (
        myOff.length === 0 ? <div className="empty-state"><h3>Sin ofertas enviadas</h3></div> :
        <div className="order-list">
          {myOff.map(off => {
            const ord = orders.find(o => o.id === off.orderId)
            const stBadge = off.status === 'accepted' ? <span className="badge badge-accepted">✅ Aceptada</span>
              : off.status === 'rejected' ? <span className="badge" style={{ background: '#1A0808', color: '#888', border: '1px solid #2A0A0A' }}>✗ No elegida</span>
              : <span className="badge badge-pending">⏳ Pendiente</span>
            return (
              <div key={off.id} className="order-card">
                <div className="order-header" style={{ cursor: 'default' }}>
                  <div>
                    <div className="order-title">{ord?.summary?.titulo}</div>
                    <div className="order-meta"><span className="badge badge-service">{ord?.service?.name}</span>{stBadge}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="offer-price" style={{ fontSize: '18px' }}>S/ {off.price}</div>
                    <div className="offer-delivery">🕐 {off.deliveryDays} días</div>
                  </div>
                </div>
                {off.status === 'accepted' && (
                  <div style={{ padding: '12px 18px', borderTop: '1px solid #1E1E1E', background: '#020C07', fontSize: '12px', color: '#FBBF24' }}>
                    Comisión a pagar: <strong>S/ {(off.price * 0.05).toFixed(2)}</strong> (5% del precio acordado)
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'commissions' && <CommissionsView commissions={myComm} orders={orders} onMarkPaid={onMarkPaid} />}
    </div>
  )
}

function CommissionsView({ commissions, orders, onMarkPaid }) {
  const pending = commissions.filter(c => !c.paid).reduce((s, c) => s + c.amount, 0)
  const paid = commissions.filter(c => c.paid).reduce((s, c) => s + c.amount, 0)
  return (
    <div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Pendientes</div><div className="stat-value">S/ {pending.toFixed(2)}</div><div className="stat-sub">{commissions.filter(c => !c.paid).length} por pagar</div></div>
        <div className="stat-card"><div className="stat-label">Pagadas</div><div className="stat-value" style={{ color: '#34D399' }}>S/ {paid.toFixed(2)}</div><div className="stat-sub">{commissions.filter(c => c.paid).length} completadas</div></div>
        <div className="stat-card"><div className="stat-label">Total generado</div><div className="stat-value" style={{ color: '#60A5FA' }}>S/ {(pending + paid).toFixed(2)}</div><div className="stat-sub">{commissions.length} operaciones</div></div>
      </div>
      {commissions.length === 0 ? (
        <div className="empty-state"><h3>Sin comisiones</h3><p>Se generan cuando un cliente acepta tu oferta.</p></div>
      ) : (
        <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '9px', overflow: 'hidden' }}>
          <table className="comm-table">
            <thead><tr><th>Taller</th><th>Pedido</th><th>Precio</th><th>Comisión 5%</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
            <tbody>
              {commissions.map(c => {
                const ord = orders.find(o => o.id === c.orderId)
                return (
                  <tr key={c.id}>
                    <td><strong style={{ color: '#F0EDE8' }}>{c.workshopName}</strong></td>
                    <td style={{ color: '#777', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord?.summary?.titulo}</td>
                    <td>S/ {c.agreedPrice.toFixed(2)}</td>
                    <td><span className="comm-value">S/ {c.amount.toFixed(2)}</span></td>
                    <td><span className={c.paid ? 'paid-yes' : 'paid-no'}>{c.paid ? '✓ Pagada' : '⏳ Pendiente'}</span></td>
                    <td>{fmtDate(c.createdAt)}</td>
                    <td>{!c.paid && <button className="btn btn-success btn-sm" onClick={() => onMarkPaid(c.id)}>Marcar pagada</button>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [screen, setScreen] = useState('auth')
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(() => loadState('fm_users', DEMO_USERS))
  const [orders, setOrders] = useState(() => loadState('fm_orders', initialOrders))
  const [offers, setOffers] = useState(() => loadState('fm_offers', DEMO_OFFERS))
  const [commissions, setCommissions] = useState(() => loadState('fm_commissions', []))
  const [service, setService] = useState(null)
  const [toast, setToast] = useState(null)

  // Guardar en localStorage cuando cambian
  useEffect(() => { saveState('fm_orders', orders) }, [orders])
  useEffect(() => { saveState('fm_offers', offers) }, [offers])
  useEffect(() => { saveState('fm_commissions', commissions) }, [commissions])
  useEffect(() => { saveState('fm_users', users) }, [users])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }
  function loginAs(u) { setUser(u); setScreen(u.type === 'client' ? 'services' : 'workshop-dash') }
  function logout() { setUser(null); setScreen('auth') }

  function registerWorkshop(form) {
    const u = { id: `w-${Date.now()}`, type: 'workshop', name: form.name, workshopName: form.shop, whatsapp: form.wa, location: 'Lima, Perú' }
    setUsers(prev => [...prev, u]); loginAs(u); showToast('¡Taller registrado!')
  }

  function publishOrder(draft, svc, images) {
    const ord = {
      id: `ord-${Date.now()}`, clientId: user.id, clientName: user.name,
      service: svc, summary: draft, status: 'open',
      images: images || [],
      createdAt: new Date().toISOString()
    }
    setOrders(prev => [...prev, ord]); setScreen('my-orders'); showToast('¡Pedido publicado!')
  }

  function acceptOffer(off) {
    setOffers(prev => prev.map(o => o.id === off.id ? { ...o, status: 'accepted' } : o.orderId === off.orderId ? { ...o, status: 'rejected' } : o))
    setOrders(prev => prev.map(o => o.id === off.orderId ? { ...o, status: 'in-progress' } : o))
    const comm = { id: `c-${Date.now()}`, offerId: off.id, orderId: off.orderId, workshopId: off.workshopId, workshopName: off.workshopName, agreedPrice: off.price, amount: parseFloat((off.price * 0.05).toFixed(2)), paid: false, createdAt: new Date().toISOString() }
    setCommissions(prev => [...prev, comm])
    showToast(`¡Aceptada! Comisión: S/ ${(off.price * 0.05).toFixed(2)}`)
  }

  function submitOffer(orderId, form, workshopUser) {
    const off = { id: `off-${Date.now()}`, orderId, workshopId: workshopUser.id, workshopName: workshopUser.workshopName, workshopWhatsapp: workshopUser.whatsapp, location: workshopUser.location || 'Lima', price: parseFloat(form.price), deliveryDays: parseInt(form.days), message: form.msg, status: 'pending', createdAt: new Date().toISOString() }
    setOffers(prev => [...prev, off]); showToast('¡Oferta enviada!')
  }

  function markPaid(id) { setCommissions(prev => prev.map(c => c.id === id ? { ...c, paid: true } : c)); showToast('Comisión marcada como pagada.') }

  return (
    <>
      <Head>
        <title>FabMarket — Manufactura a tu medida</title>
        <meta name="description" content="Conectamos clientes con talleres de manufactura en Lima" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav user={user} screen={screen} setScreen={setScreen} logout={logout} />
      {screen === 'auth' && <AuthScreen users={users} currentUser={user} loginAs={loginAs} setScreen={setScreen} />}
      {screen === 'register-workshop' && <RegisterScreen setScreen={setScreen} onRegister={registerWorkshop} />}
      {screen === 'services' && <ServicesScreen onSelect={s => { setService(s); setScreen('chat') }} />}
      {screen === 'chat' && service && <ChatScreen service={service} onPublish={publishOrder} />}
      {screen === 'my-orders' && <MyOrdersScreen orders={orders} offers={offers} user={user} onAccept={acceptOffer} />}
      {screen === 'workshop-dash' && <WorkshopDash orders={orders} offers={offers} commissions={commissions} user={user} onSubmitOffer={submitOffer} onMarkPaid={markPaid} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
