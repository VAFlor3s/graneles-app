import { LB, getProductos, getVentas, insertVenta, deleteVenta, subscribeProductos } from './supabase.js'

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
        <span style="font-weight:600;font-size:15px;color:#1F2937">VAFlor3s's Nuts</span>
        <span style="font-size:11px;padding:3px 10px;background:#E1F5EE;color:#085041;border-radius:10px;font-weight:500">Vendedor</span>
      </div>
      <div style="display:flex;align-items:center;gap:14px">
        <span style="font-size:13px;color:#4B5563">Hola, <strong>${nombre}</strong></span>
        <button id="v-logout" style="font-size:12px;padding:6px 14px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;color:#4B5563">Salir</button>
      </div>
    </nav>

    <div style="max-width:860px;margin:0 auto;padding:24px;display:grid;gap:20px">

      <!-- CALCULADORA -->
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

        <!-- RESULTADO -->
        <div id="v-resultado" style="background:#F3F4F6;border-radius:10px;padding:16px;margin-bottom:14px;text-align:center;color:#9CA3AF;font-size:13px">
          Selecciona un producto e ingresa el monto
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="v-limpiar" style="padding:9px 20px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;font-size:13px;color:#4B5563">Limpiar</button>
          <button id="v-registrar" style="padding:9px 20px;background:#1D9E75;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600">Registrar venta</button>
        </div>
      </div>

      <!-- TABLA VENTAS HOY -->
      <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h2 style="font-size:15px;font-weight:600;color:#1F2937">Ventas de hoy</h2>
          <div style="display:flex;gap:8px">
            <span id="v-total-hoy" style="font-size:13px;padding:4px 12px;background:#E1F5EE;color:#085041;border-radius:10px;font-weight:600">$0.00</span>
            <span id="v-util-hoy" style="font-size:13px;padding:4px 12px;background:#F3F4F6;color:#4B5563;border-radius:10px">$0.00 utilidad</span>
          </div>
        </div>
        <div id="v-empty" style="text-align:center;padding:32px;color:#9CA3AF;font-size:13px">Sin ventas registradas hoy</div>
        <table id="v-tabla" class="hidden" style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #E5E7EB">
            <th style="text-align:left;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Producto</th>
            <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Monto</th>
            <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Gramos</th>
            <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">$/gr</th>
            <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Utilidad</th>
            <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Turno</th>
            <th></th>
          </tr></thead>
          <tbody id="v-tbody"></tbody>
        </table>
      </div>

    </div>
    <div id="v-toast" style="position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;color:#fff;opacity:0;transition:opacity .3s;pointer-events:none;z-index:999"></div>`

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function toast(msg, err = false) {
    const t = el.querySelector('#v-toast')
    t.textContent = msg
    t.style.background = err ? '#E24B4A' : '#1D9E75'
    t.style.opacity = '1'
    setTimeout(() => { t.style.opacity = '0' }, 2600)
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
    const pLb   = parseFloat(opt.dataset.precio)
    const cLb   = parseFloat(opt.dataset.costo)
    const pGr   = pLb / LB
    const cGr   = cLb / LB
    const gramos = monto / pGr
    const util   = (pGr - cGr) * gramos
    const margen = pGr > 0 ? (pGr - cGr) / pGr * 100 : 0

    res.style.background = '#E1F5EE'; res.style.color = '#085041'
    res.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="text-align:left">
          <div style="font-size:11px;opacity:.7;margin-bottom:3px">${opt.textContent} — $${monto.toFixed(2)}</div>
          <div style="font-size:36px;font-weight:700;line-height:1;color:#0F6E56">${gramos.toFixed(1)} g</div>
          <div style="font-size:12px;margin-top:4px;opacity:.8">${(gramos/LB).toFixed(3)} lb &nbsp;·&nbsp; ${(gramos/1000).toFixed(3)} kg</div>
        </div>
        <div style="text-align:right;font-size:13px;line-height:2">
          <div>Precio/gr: <strong>$${pGr.toFixed(4)}</strong></div>
          <div>Utilidad: <strong>$${util.toFixed(2)}</strong></div>
          <div>Margen: <strong>${margen.toFixed(1)}%</strong></div>
        </div>
      </div>`
  }

  function renderTabla() {
    const hoy   = ventas.filter(v => v.fecha === today)
    const tbody = el.querySelector('#v-tbody')
    const tabla = el.querySelector('#v-tabla')
    const empty = el.querySelector('#v-empty')
    const total = hoy.reduce((s, v) => s + Number(v.monto), 0)
    const util  = hoy.reduce((s, v) => s + Number(v.utilidad), 0)

    el.querySelector('#v-total-hoy').textContent = `$${total.toFixed(2)}`
    el.querySelector('#v-util-hoy').textContent  = `$${util.toFixed(2)} utilidad`

    if (!hoy.length) { tabla.classList.add('hidden'); empty.style.display = 'block'; return }
    tabla.classList.remove('hidden'); empty.style.display = 'none'

    tbody.innerHTML = hoy.map(v => `
      <tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:9px 6px;font-weight:500">${v.producto_nombre}</td>
        <td style="padding:9px 6px;text-align:right">$${Number(v.monto).toFixed(2)}</td>
        <td style="padding:9px 6px;text-align:right;color:#0F6E56;font-weight:600">${Number(v.gramos).toFixed(1)} g</td>
        <td style="padding:9px 6px;text-align:right;color:#9CA3AF;font-size:12px">$${Number(v.precio_gr).toFixed(4)}</td>
        <td style="padding:9px 6px;text-align:right;color:#0F6E56">$${Number(v.utilidad).toFixed(2)}</td>
        <td style="padding:9px 6px;text-align:right;font-size:12px;color:#9CA3AF">${v.turno}</td>
        <td style="padding:9px 6px;text-align:right">
          <button onclick="window._delVenta(${v.id})"
            style="padding:3px 9px;background:#FCEBEB;color:#A32D2D;border:none;border-radius:6px;font-size:12px;cursor:pointer">×</button>
        </td>
      </tr>`).join('')
  }

  function renderProductos() {
    const sel = el.querySelector('#v-producto')
    const val = sel.value
    sel.innerHTML = '<option value="">— seleccionar —</option>'
    productos.forEach(p => {
      const o = document.createElement('option')
      o.value = p.id; o.textContent = p.nombre
      o.dataset.precio = p.precio_lb; o.dataset.costo = p.costo_lb
      sel.appendChild(o)
    })
    if (val) sel.value = val
    calcGramos()
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────
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

    const pLb  = parseFloat(opt.dataset.precio)
    const cLb  = parseFloat(opt.dataset.costo)
    const pGr  = pLb / LB
    const cGr  = cLb / LB
    const gramos = monto / pGr

    const btn = el.querySelector('#v-registrar')
    btn.disabled = true; btn.textContent = 'Guardando...'
    try {
      const nueva = await insertVenta({
        fecha: today, vendedor: nombre, turno,
        producto_id: parseInt(opt.value),
        producto_nombre: opt.textContent,
        monto, precio_gr: pGr, costo_gr: cGr,
        gramos, utilidad: (pGr - cGr) * gramos,
        margen: pGr > 0 ? (pGr - cGr) / pGr : 0
      })
      ventas.unshift(nueva)
      el.querySelector('#v-producto').value = ''
      el.querySelector('#v-monto').value = ''
      calcGramos(); renderTabla()
      toast('Venta registrada')
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

  // Realtime: si el admin cambia precios, el vendedor los ve al instante
  subscribeProductos(() => getProductos().then(p => { productos = p; renderProductos() }))

  // Carga inicial
  try {
    [productos, ventas] = await Promise.all([getProductos(), getVentas(today, today)])
    renderProductos(); renderTabla()
  } catch(e) { toast('Error al cargar datos', true) }

  return el
}
