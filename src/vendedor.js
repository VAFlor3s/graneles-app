import { LB, getProductos, getVentas, insertVenta, deleteVenta, subscribeProductos, supabase } from './supabase.js'

export async function renderVendedor(nombre, onLogout) {
  let productos = []
  let ventas    = []
  const today   = new Date().toISOString().split('T')[0]

  const el = document.createElement('div')
  el.style.cssText = 'min-height:100vh;background:#F9FAFB'

  el.innerHTML = `
    <nav style="background:#fff;border-bottom:1px solid #E5E7EB;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:54px;position:sticky;top:0;z-index:10">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:22px">🌰</span>
        <span style="font-weight:600;font-size:15px;color:#1F2937">VAFlor3s\'s Nuts</span>
        <span style="font-size:11px;padding:3px 10px;background:#E1F5EE;color:#085041;border-radius:10px;font-weight:500">Vendedor</span>
      </div>
      <div style="display:flex;align-items:center;gap:14px">
        <span style="font-size:13px;color:#4B5563">Hola, <strong>${nombre}</strong></span>
        <button id="v-logout" style="font-size:12px;padding:6px 14px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;color:#4B5563">Salir</button>
      </div>
    </nav>

    <!-- TABS VENDEDOR -->
    <div style="background:#fff;border-bottom:1px solid #E5E7EB;padding:0 24px;display:flex;gap:4px">
      <button class="v-tab active" data-tab="vender" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid #1D9E75;color:#1D9E75">💰 Vender</button>
      <button class="v-tab" data-tab="precios" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;color:#6B7280">📋 Lista de precios</button>
    </div>

    <div style="max-width:860px;margin:0 auto;padding:24px;display:grid;gap:20px">

      <!-- TAB: VENDER -->
      <div id="tab-vender">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
          <h2 style="font-size:15px;font-weight:600;color:#1F2937;margin-bottom:16px">Nueva venta</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
            <div>
              <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:5px">Turno</label>
              <select id="v-turno" style="width:100%;padding:9px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff">
                <option>Mañana</option><option>Tarde</option><option>Noche</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:5px">Producto</label>
              <select id="v-producto" style="width:100%;padding:9px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff">
                <option value="">— seleccionar —</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:5px">Monto solicitado ($)</label>
              <input id="v-monto" type="number" min="0" step="0.01" placeholder="ej: 4.00"
                style="width:100%;padding:9px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
            </div>
          </div>

          <!-- RESULTADO CALCULADORA -->
          <div id="v-resultado" style="background:#F3F4F6;border-radius:10px;padding:16px;margin-bottom:14px;text-align:center;color:#9CA3AF;font-size:13px">
            Selecciona un producto e ingresa el monto
          </div>

          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button id="v-limpiar" style="padding:9px 20px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;font-size:13px;color:#4B5563">Limpiar</button>
            <button id="v-registrar" style="padding:9px 20px;background:#1D9E75;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600">Registrar venta</button>
          </div>
        </div>

        <!-- VENTAS HOY -->
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h2 style="font-size:15px;font-weight:600;color:#1F2937">Ventas de hoy</h2>
            <span id="v-total-hoy" style="font-size:13px;padding:4px 12px;background:#E1F5EE;color:#085041;border-radius:10px;font-weight:600">$0.00 total</span>
          </div>
          <div id="v-empty" style="text-align:center;padding:32px;color:#9CA3AF;font-size:13px">Sin ventas registradas hoy</div>
          <table id="v-tabla" class="hidden" style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="border-bottom:1px solid #E5E7EB">
              <th style="text-align:left;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Producto</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Monto</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Cantidad</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Turno</th>
              <th></th>
            </tr></thead>
            <tbody id="v-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- TAB: LISTA DE PRECIOS -->
      <div id="tab-precios" class="hidden">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
          <h2 style="font-size:15px;font-weight:600;color:#1F2937;margin-bottom:4px">Lista de precios</h2>
          <p style="font-size:12px;color:#9CA3AF;margin-bottom:16px">Precios de venta al público · se actualiza automáticamente</p>
          <div id="v-lista-precios" style="display:grid;gap:6px"></div>
        </div>
      </div>

    </div>
    <div id="v-toast" style="position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;color:#fff;opacity:0;transition:opacity .3s;pointer-events:none;z-index:999"></div>`

  // ── Tab switching ─────────────────────────────────────────────────────────────
  el.querySelectorAll('.v-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.v-tab').forEach(b => {
        b.style.borderBottomColor = 'transparent'; b.style.color = '#6B7280'
      })
      btn.style.borderBottomColor = '#1D9E75'; btn.style.color = '#1D9E75'
      el.querySelectorAll('[id^="tab-"]').forEach(t => t.classList.add('hidden'))
      el.querySelector('#tab-' + btn.dataset.tab).classList.remove('hidden')
    })
  })

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function toast(msg, err = false) {
    const t = el.querySelector('#v-toast')
    t.textContent = msg; t.style.background = err ? '#E24B4A' : '#1D9E75'
    t.style.opacity = '1'; setTimeout(() => { t.style.opacity = '0' }, 2600)
  }

  // Detectar tipo de producto
  function getTipo(p) {
    if (p.tipo === 'unidad') return 'unidad'
    if (p.tipo === 'mix')    return 'mix'
    return 'granel'
  }

  // Gramos fijos totales de un mix (suma de gramos_fijos de cada componente)
  function getGramosMix(prod) {
    if (!prod.componentes) return 182 // fallback
    try {
      const comps = JSON.parse(prod.componentes)
      return comps.reduce((s, c) => s + (c.gramos_fijos || 0), 0)
    } catch(e) { return 182 }
  }

  // Calcular resultado según tipo
  function calcResultado(prod, monto) {
    const tipo = getTipo(prod)
    const pLb  = Number(prod.precio_lb)
    const pGr  = pLb / LB

    if (tipo === 'unidad') {
      const unidades = pLb > 0 ? monto / pLb : 0
      return {
        tipo,
        cantidad: unidades,
        gramos_total: 0,
        label: unidades.toFixed(2) + ' unidades',
        sublabel: `$${pLb.toFixed(2)} por unidad`
      }
    }

    if (tipo === 'mix') {
      // Precio fijo por porción: precio_lb = precio por mix
      const pPorcion    = pLb
      const unidades    = pPorcion > 0 ? Math.floor(monto / pPorcion) : 0
      const gramosMix   = getGramosMix(prod)
      const gramosTotal = unidades * gramosMix
      return {
        tipo,
        cantidad: unidades,
        gramos_total: gramosTotal,
        label: unidades + (unidades === 1 ? ' mix' : ' mixes'),
        sublabel: `${gramosTotal}g total · $${pPorcion.toFixed(2)} por mix`
      }
    }

    // Granel (default)
    const gramos = pGr > 0 ? monto / pGr : 0
    return {
      tipo,
      cantidad: gramos,
      gramos_total: gramos,
      label: gramos.toFixed(1) + ' g',
      sublabel: `(${(gramos/LB).toFixed(3)} lb · ${(gramos/1000).toFixed(3)} kg)`
    }
  }

  function calcGramos() {
    const sel   = el.querySelector('#v-producto')
    const opt   = sel.options[sel.selectedIndex]
    const monto = parseFloat(el.querySelector('#v-monto').value)
    const res   = el.querySelector('#v-resultado')

    if (!opt || !opt.value || isNaN(monto) || monto <= 0) {
      res.style.background = '#F3F4F6'; res.style.color = '#9CA3AF'
      res.innerHTML = 'Selecciona un producto e ingresa el monto'
      return
    }

    const prod   = productos.find(p => p.id === parseInt(opt.value))
    if (!prod) return
    const result = calcResultado(prod, monto)

    res.style.background = '#E1F5EE'; res.style.color = '#085041'

    let mixInfo = ''
    if (result.tipo === 'mix' && prod.componentes) {
  try {
    const comps = JSON.parse(prod.componentes)
    mixInfo = `
      <div style="margin-top:10px;padding:10px 14px;background:#fff;border-radius:8px;border:1px solid #9FE1CB;text-align:left">
        <div style="font-size:11px;font-weight:600;color:#085041;margin-bottom:8px;text-transform:uppercase">Ingredientes a pesar (${result.cantidad} mix${result.cantidad !== 1 ? 'es' : ''})</div>
        ${comps.map(c => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #E1F5EE">
            <span style="font-size:13px;color:#1F2937;font-weight:500">${c.nombre}</span>
            <span style="font-size:15px;font-weight:700;color:#0F6E56">${c.gramos_fijos * result.cantidad}g</span>
          </div>`).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px">
          <span style="font-size:12px;color:#4B5563;font-weight:500">TOTAL</span>
          <span style="font-size:14px;font-weight:700;color:#1F2937">${comps.reduce((s,c) => s + c.gramos_fijos, 0) * result.cantidad}g</span>
        </div>
      </div>`
    } catch(e) {}
  }

    res.innerHTML = `
      <div style="text-align:center">
        <div style="font-size:12px;opacity:.7;margin-bottom:4px">${prod.nombre} — $${monto.toFixed(2)}</div>
        <div style="font-size:42px;font-weight:700;line-height:1;color:#0F6E56">${result.label}</div>
        <div style="font-size:13px;margin-top:6px;opacity:.8">${result.sublabel}</div>
        ${mixInfo}
      </div>`
  }

  // ── Lista de precios ──────────────────────────────────────────────────────────
  function renderListaPrecios() {
    const lista = el.querySelector('#v-lista-precios')
    if (!lista) return

    lista.innerHTML = productos.map(p => {
      const pLb  = Number(p.precio_lb)
      const pGr  = pLb / LB
      const tipo = getTipo(p)

      let filas = ''

      if (tipo === 'unidad') {
        filas = `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
            <span style="font-size:12px;color:#6B7280">Por unidad</span>
            <span style="font-size:14px;font-weight:600;color:#1F2937">$${pLb.toFixed(2)}</span>
          </div>`
      } else if (tipo === 'mix') {
        const gramosMix = getGramosMix(p)
        filas = `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
            <span style="font-size:12px;color:#6B7280">Por mix (${gramosMix}g)</span>
            <span style="font-size:14px;font-weight:600;color:#1F2937">$${pLb.toFixed(2)}</span>
          </div>`
      } else {
        const g_por_1dolar  = pGr > 0 ? (1 / pGr) : 0
        const g_media_libra = LB / 2
        const precio_media  = pGr * g_media_libra
        filas = `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #F3F4F6">
            <span style="font-size:12px;color:#6B7280">$1.00</span>
            <span style="font-size:13px;font-weight:600;color:#1F2937">${g_por_1dolar.toFixed(1)} g</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #F3F4F6">
            <span style="font-size:12px;color:#6B7280">½ libra (${g_media_libra.toFixed(0)} g)</span>
            <span style="font-size:13px;font-weight:600;color:#1F2937">$${precio_media.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">
            <span style="font-size:12px;color:#6B7280">1 libra (${LB.toFixed(0)} g)</span>
            <span style="font-size:13px;font-weight:600;color:#1F2937">$${pLb.toFixed(2)}</span>
          </div>`
      }

      const tipoBadge = tipo === 'unidad'
        ? '<span style="font-size:10px;padding:1px 6px;background:#E6F1FB;color:#0C447C;border-radius:6px;margin-left:6px">por unidad</span>'
        : tipo === 'mix'
          ? '<span style="font-size:10px;padding:1px 6px;background:#FAEEDA;color:#633806;border-radius:6px;margin-left:6px">mix</span>'
          : ''

      return `<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:12px 14px">
        <div style="font-size:13px;font-weight:600;color:#1F2937;margin-bottom:6px">${p.nombre}${tipoBadge}</div>
        ${filas}
      </div>`
    }).join('')
  }

  // ── Tabla ventas del día ──────────────────────────────────────────────────────
  function renderTabla() {
    const hoy   = ventas.filter(v => v.fecha === today)
    const tbody = el.querySelector('#v-tbody')
    const tabla = el.querySelector('#v-tabla')
    const empty = el.querySelector('#v-empty')
    const total = hoy.reduce((s, v) => s + Number(v.monto), 0)

    el.querySelector('#v-total-hoy').textContent = `$${total.toFixed(2)} total`

    if (!hoy.length) { tabla.classList.add('hidden'); empty.style.display = 'block'; return }
    tabla.classList.remove('hidden'); empty.style.display = 'none'

    tbody.innerHTML = hoy.map(v => {
      let cantidadLabel
      if (v.tipo_venta === 'unidad') {
        cantidadLabel = Number(v.gramos).toFixed(2) + ' und'
      } else if (v.tipo_venta === 'mix') {
        // gramos guarda gramos totales; mostrar cuántos mixes fueron
        const prod      = productos.find(p => p.id === v.producto_id)
        const gramosMix = prod ? getGramosMix(prod) : 182
        const unidades  = gramosMix > 0 ? Math.round(Number(v.gramos) / gramosMix) : 1
        cantidadLabel   = unidades + (unidades === 1 ? ' mix' : ' mixes') + ` (${Number(v.gramos).toFixed(0)}g)`
      } else {
        cantidadLabel = Number(v.gramos).toFixed(1) + ' g'
      }
      return `<tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:9px 6px;font-weight:500">${v.producto_nombre}</td>
        <td style="padding:9px 6px;text-align:right">$${Number(v.monto).toFixed(2)}</td>
        <td style="padding:9px 6px;text-align:right;color:#0F6E56;font-weight:600">${cantidadLabel}</td>
        <td style="padding:9px 6px;text-align:right;font-size:12px;color:#9CA3AF">${v.turno}</td>
        <td style="padding:9px 6px;text-align:right">
          <button onclick="window._delVenta(${v.id})"
            style="padding:3px 9px;background:#FCEBEB;color:#A32D2D;border:none;border-radius:6px;font-size:12px;cursor:pointer">×</button>
        </td>
      </tr>`
    }).join('')
  }

  function renderProductos() {
    const sel = el.querySelector('#v-producto')
    const val = sel.value
    sel.innerHTML = '<option value="">— seleccionar —</option>'

    const granel = productos.filter(p => getTipo(p) !== 'unidad')
    const unidad = productos.filter(p => getTipo(p) === 'unidad')

    if (granel.length) {
      const og = document.createElement('optgroup')
      og.label = 'Por peso'
      granel.forEach(p => {
        const o = document.createElement('option')
        o.value = p.id; o.textContent = p.nombre + (getTipo(p) === 'mix' ? ' (mix)' : '')
        og.appendChild(o)
      })
      sel.appendChild(og)
    }
    if (unidad.length) {
      const ou = document.createElement('optgroup')
      ou.label = 'Por unidad'
      unidad.forEach(p => {
        const o = document.createElement('option')
        o.value = p.id; o.textContent = p.nombre
        ou.appendChild(o)
      })
      sel.appendChild(ou)
    }

    if (val) sel.value = val
    calcGramos()
    renderListaPrecios()
  }

  // ── Eventos ───────────────────────────────────────────────────────────────────
  el.querySelector('#v-producto').addEventListener('change', calcGramos)
  el.querySelector('#v-monto').addEventListener('input', calcGramos)

  el.querySelector('#v-limpiar').addEventListener('click', () => {
    el.querySelector('#v-producto').value = ''
    el.querySelector('#v-monto').value = ''
    calcGramos()
  })

  el.querySelector('#v-registrar').addEventListener('click', async () => {
    const sel   = el.querySelector('#v-producto')
    const opt   = sel.options[sel.selectedIndex]
    const monto = parseFloat(el.querySelector('#v-monto').value)
    const turno = el.querySelector('#v-turno').value

    if (!opt || !opt.value) { toast('Selecciona un producto', true); return }
    if (isNaN(monto) || monto <= 0) { toast('Ingresa un monto válido', true); return }

    const prod   = productos.find(p => p.id === parseInt(opt.value))
    if (!prod) return
    const result = calcResultado(prod, monto)
    const tipo   = getTipo(prod)
    const pLb    = Number(prod.precio_lb)
    const cLb    = Number(prod.costo_lb)
    const pGr    = pLb / LB
    const cGr    = cLb / LB

    // Para mix: guardar gramos totales reales en la columna gramos
    // Para granel/unidad: guardar la cantidad calculada normalmente
    const gramosVenta = tipo === 'mix'
      ? result.gramos_total          // unidades × gramos por mix
      : result.cantidad              // gramos (granel) o unidades

    const utilidadVenta = tipo === 'unidad'
      ? (pLb - cLb) * result.cantidad
      : tipo === 'mix'
        ? (pLb - cLb) * result.cantidad   // utilidad por porción × unidades
        : (pGr - cGr) * result.cantidad

    if (tipo === 'mix' && result.cantidad === 0) {
      toast('El monto no alcanza para ningún mix ($' + pLb.toFixed(2) + ' por mix)', true)
      return
    }

    const btn = el.querySelector('#v-registrar')
    btn.disabled = true; btn.textContent = 'Guardando...'
    try {
      const nueva = await insertVenta({
        fecha: today, vendedor: nombre, turno,
        producto_id:     prod.id,
        producto_nombre: prod.nombre,
        monto,
        precio_gr: tipo === 'unidad' ? pLb : pGr,
        costo_gr:  tipo === 'unidad' ? cLb : cGr,
        gramos:    gramosVenta,
        utilidad:  utilidadVenta,
        margen:    pLb > 0 ? (pLb - cLb) / pLb : 0,
        tipo_venta: tipo
      })
      ventas.unshift(nueva)
      el.querySelector('#v-producto').value = ''
      el.querySelector('#v-monto').value = ''
      calcGramos(); renderTabla()
      toast('Venta registrada ✓')
    } catch(e) {
      toast('Error al guardar. Revisa tu conexión.', true)
    } finally {
      btn.disabled = false; btn.textContent = 'Registrar venta'
    }
  })

  el.querySelector('#v-logout').addEventListener('click', onLogout)

  window._delVenta = async (id) => {
    if (!confirm('¿Eliminar esta venta?')) return
    try { await deleteVenta(id); ventas = ventas.filter(v => v.id !== id); renderTabla(); toast('Eliminada') }
    catch(e) { toast('Error al eliminar', true) }
  }

  subscribeProductos(() => getProductos().then(p => { productos = p; renderProductos() }))

  try {
    [productos, ventas] = await Promise.all([getProductos(), getVentas(today, today)])
    renderProductos(); renderTabla()
  } catch(e) { toast('Error al cargar datos', true) }

  return el
}
