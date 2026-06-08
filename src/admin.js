import { getProductos, updateProducto, getVentas, getGastos, insertGasto, deleteGasto, deleteVenta, subscribeVentas, supabase } from './supabase.js'

export async function renderAdmin(nombre, onLogout) {
  let productos = [], ventas = [], gastos = []
  const hoy = new Date().toISOString().split('T')[0]
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  let filtroDesde = primerDiaMes
  let filtroHasta = hoy

  const el = document.createElement('div')
  el.style.cssText = 'min-height:100vh;background:#F9FAFB'

  el.innerHTML = `
    <nav style="background:#fff;border-bottom:1px solid #E5E7EB;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:54px;position:sticky;top:0;z-index:10">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:22px">🌰</span>
        <span style="font-weight:600;font-size:15px;color:#1F2937">VAFlor3s's Nuts</span>
        <span style="font-size:11px;padding:3px 10px;background:#E6F1FB;color:#0C447C;border-radius:10px;font-weight:500">Administrador</span>
      </div>
      <div style="display:flex;align-items:center;gap:14px">
        <span style="font-size:13px;color:#4B5563">Hola, <strong>${nombre}</strong></span>
        <button id="a-logout" style="font-size:12px;padding:6px 14px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;color:#4B5563">Salir</button>
      </div>
    </nav>

    <!-- TABS -->
    <div style="background:#fff;border-bottom:1px solid #E5E7EB;padding:0 24px;display:flex;gap:4px">
      <button class="a-tab active" data-tab="dashboard" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid #1D9E75;color:#1D9E75">📊 Dashboard</button>
      <button class="a-tab" data-tab="productos" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;color:#6B7280">🌰 Productos</button>
      <button class="a-tab" data-tab="inventario" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;color:#6B7280">📦 Inventario</button>
      <button class="a-tab" data-tab="mercancia" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;color:#6B7280">🛒 Compra Mercancía</button>
      <button class="a-tab" data-tab="operacional" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;color:#6B7280">💼 Gastos Operacionales</button>
      <button class="a-tab" data-tab="ventas" style="padding:12px 16px;font-size:13px;font-weight:500;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;color:#6B7280">📋 Historial Ventas</button>
    </div>

    <div style="max-width:1100px;margin:0 auto;padding:24px;display:grid;gap:20px">

      <!-- FILTRO FECHAS -->
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:13px;color:#4B5563;font-weight:500">Período:</span>
        <input id="a-desde" type="date" value="${filtroDesde}" style="padding:7px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
        <span style="color:#9CA3AF">—</span>
        <input id="a-hasta" type="date" value="${filtroHasta}" style="padding:7px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
        <button id="a-filtrar" style="padding:8px 16px;background:#1F3864;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:500">Aplicar</button>
      </div>

      <!-- TAB: DASHBOARD -->
      <div id="tab-dashboard">
        <div id="a-kpis" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px" id="a-kpis2"></div>
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
          <h2 style="font-size:15px;font-weight:600;color:#1F2937;margin-bottom:16px">Rentabilidad por producto</h2>
          <div id="a-prod-empty" style="text-align:center;padding:24px;color:#9CA3AF;font-size:13px">Sin ventas en el período</div>
          <table id="a-prod-tabla" class="hidden" style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="border-bottom:1px solid #E5E7EB">
              <th style="text-align:left;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Producto</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Ventas $</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Gramos</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Utilidad $</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Margen</th>
              <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Ventas</th>
            </tr></thead>
            <tbody id="a-prod-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- TAB: PRODUCTOS -->
      <div id="tab-productos" class="hidden">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h2 style="font-size:15px;font-weight:600;color:#1F2937">Productos y precios</h2>
            <div style="display:flex;gap:8px">
              <button id="a-guardar-precios" style="padding:7px 14px;background:#1D9E75;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600">Guardar cambios</button>
              <button id="a-nuevo-producto" style="padding:7px 14px;background:#1F3864;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600">+ Nuevo producto</button>
            </div>
          </div>
          <div id="a-form-nuevo" style="display:none;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:16px;margin-bottom:16px">
            <div style="font-size:13px;font-weight:600;color:#065F46;margin-bottom:12px">Agregar nuevo producto</div>
            <div style="display:grid;grid-template-columns:1fr 120px 120px auto;gap:10px;align-items:end">
              <div>
                <label style="font-size:11px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">NOMBRE</label>
                <input id="nuevo-nombre" type="text" placeholder="ej: MACADAMIA TOSTADA" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;text-transform:uppercase">
              </div>
              <div>
                <label style="font-size:11px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">PRECIO $/LB</label>
                <input id="nuevo-precio" type="number" min="0" step="0.01" placeholder="0.00" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
              </div>
              <div>
                <label style="font-size:11px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">COSTO $/LB</label>
                <input id="nuevo-costo" type="number" min="0" step="0.01" placeholder="0.00" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
              </div>
              <div style="display:flex;gap:6px">
                <button id="a-confirmar-nuevo" style="padding:8px 14px;background:#1D9E75;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600">Agregar</button>
                <button id="a-cancelar-nuevo" style="padding:8px 10px;background:#fff;border:1px solid #E5E7EB;border-radius:8px;font-size:13px;color:#4B5563">✕</button>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 90px 90px 80px 64px 36px;gap:4px;padding-bottom:6px;border-bottom:1px solid #E5E7EB;margin-bottom:4px">
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Producto</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Venta $/lb</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Costo $/lb</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Tipo</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Margen</span>
            <span></span>
          </div>
          <div id="a-precios-lista" style="max-height:500px;overflow-y:auto"></div>
        </div>
      </div>

      <!-- TAB: INVENTARIO -->
      <div id="tab-inventario" class="hidden">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <h2 style="font-size:15px;font-weight:600;color:#1F2937">Inventario en tiempo real</h2>
            <div style="display:flex;gap:8px;align-items:center">
              <span style="font-size:12px;color:#9CA3AF">Stock inicial + entradas − ventas − merma</span>
              <button id="inv-guardar" style="padding:7px 14px;background:#1D9E75;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600">Guardar stock</button>
            </div>
          </div>
          <div style="padding:8px 12px;background:#EFF6FF;border-radius:8px;font-size:12px;color:#1E40AF;margin-bottom:14px">
            💡 Las salidas se calculan automáticamente desde las ventas registradas. Solo ingresa Stock Inicial, Entradas y Merma.
          </div>
          <div style="display:grid;grid-template-columns:1fr 100px 100px 90px 110px 110px 80px;gap:4px;padding-bottom:6px;border-bottom:1px solid #E5E7EB;margin-bottom:4px">
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Producto</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Inicial (g)</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Entradas (g)</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Merma (g)</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Salidas venta</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Stock actual</span>
            <span style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;text-align:center">Estado</span>
          </div>
          <div id="inv-lista" style="max-height:520px;overflow-y:auto"></div>
          <div id="inv-msg" style="display:none;margin-top:10px;padding:8px 12px;border-radius:8px;font-size:13px;font-weight:500"></div>
        </div>
      </div>

      <!-- TAB: COMPRA MERCANCIA -->
      <div id="tab-mercancia" class="hidden">
        <div style="display:grid;grid-template-columns:400px 1fr;gap:20px;align-items:start">
          <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
            <h2 style="font-size:15px;font-weight:600;color:#1F2937;margin-bottom:14px">Registrar compra de mercancía</h2>
            <div style="display:grid;gap:10px">
              <div>
                <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Proveedor</label>
                <input id="m-prov" type="text" placeholder="Nombre del proveedor" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
              </div>
              <div>
                <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Descripción</label>
                <input id="m-desc" type="text" placeholder="ej: 10 lb de almendras" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div>
                  <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Monto ($)</label>
                  <input id="m-monto" type="number" min="0" step="0.01" placeholder="0.00" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
                </div>
                <div>
                  <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Fecha</label>
                  <input id="m-fecha" type="date" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
                </div>
              </div>
              <div>
                <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Comprobante #</label>
                <input id="m-comprobante" type="text" placeholder="Número de factura o recibo" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
              </div>
              <button id="m-registrar" style="width:100%;padding:9px;background:#1D9E75;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600">Registrar compra</button>
            </div>
          </div>
          <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <h2 style="font-size:15px;font-weight:600;color:#1F2937">Historial de compras</h2>
              <span id="m-total-badge" style="font-size:13px;padding:3px 12px;background:#E1F5EE;color:#085041;border-radius:10px;font-weight:600">$0.00</span>
            </div>
            <div id="m-lista" style="max-height:400px;overflow-y:auto">
              <div style="text-align:center;padding:20px;color:#9CA3AF;font-size:13px">Sin compras registradas</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: GASTOS OPERACIONALES -->
      <div id="tab-operacional" class="hidden">
        <div style="display:grid;grid-template-columns:400px 1fr;gap:20px;align-items:start">
          <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
            <h2 style="font-size:15px;font-weight:600;color:#1F2937;margin-bottom:14px">Registrar gasto operacional</h2>
            <div style="display:grid;gap:10px">
              <div>
                <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Categoría</label>
                <select id="g-cat" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
                  <option>Arriendo</option><option>Servicios Básicos</option><option>Transporte</option>
                  <option>Empaque</option><option>Marketing</option><option>Sueldos</option>
                  <option>Impuestos</option><option>Mantenimiento</option><option>Otros</option>
                </select>
              </div>
              <div>
                <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Descripción</label>
                <input id="g-desc" type="text" placeholder="Descripción del gasto" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div>
                  <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Monto ($)</label>
                  <input id="g-monto" type="number" min="0" step="0.01" placeholder="0.00" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
                </div>
                <div>
                  <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:4px">Fecha</label>
                  <input id="g-fecha" type="date" style="width:100%;padding:8px 10px;border:1px solid #E5E7EB;border-radius:8px;font-size:13px">
                </div>
              </div>
              <button id="g-registrar" style="width:100%;padding:9px;background:#1F3864;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600">Registrar gasto</button>
            </div>
          </div>
          <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <h2 style="font-size:15px;font-weight:600;color:#1F2937">Historial de gastos</h2>
              <span id="g-total-badge" style="font-size:13px;padding:3px 12px;background:#FCEBEB;color:#A32D2D;border-radius:10px;font-weight:600">$0.00</span>
            </div>
            <div id="g-lista" style="max-height:400px;overflow-y:auto">
              <div style="text-align:center;padding:20px;color:#9CA3AF;font-size:13px">Sin gastos registrados</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: HISTORIAL VENTAS -->
      <div id="tab-ventas" class="hidden">
        <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:22px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h2 style="font-size:15px;font-weight:600;color:#1F2937">Historial de ventas</h2>
            <button id="a-exportar" style="padding:7px 14px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;font-size:12px;color:#4B5563">Exportar CSV</button>
          </div>
          <div id="a-hist-empty" style="text-align:center;padding:24px;color:#9CA3AF;font-size:13px">Sin ventas en el período</div>
          <div style="overflow-x:auto">
            <table id="a-hist-tabla" class="hidden" style="width:100%;border-collapse:collapse;font-size:13px;min-width:780px">
              <thead><tr style="border-bottom:1px solid #E5E7EB">
                <th style="text-align:left;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Fecha</th>
                <th style="text-align:left;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Vendedor</th>
                <th style="text-align:left;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Turno</th>
                <th style="text-align:left;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Producto</th>
                <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Monto</th>
                <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Gramos</th>
                <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Utilidad</th>
                <th style="text-align:right;padding:8px 6px;font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase">Margen</th>
                <th style="padding:8px 6px"></th>
              </tr></thead>
              <tbody id="a-hist-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
    <div id="a-toast" style="position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;color:#fff;opacity:0;transition:opacity .3s;pointer-events:none;z-index:999"></div>`

  // ── Tab switching ─────────────────────────────────────────────────────────────
  el.querySelectorAll('.a-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.a-tab').forEach(b => {
        b.style.borderBottomColor = 'transparent'; b.style.color = '#6B7280'; b.classList.remove('active')
      })
      btn.style.borderBottomColor = '#1D9E75'; btn.style.color = '#1D9E75'; btn.classList.add('active')
      const tab = btn.dataset.tab
      el.querySelectorAll('[id^="tab-"]').forEach(t => t.classList.add('hidden'))
      el.querySelector('#tab-' + tab).classList.remove('hidden')
      if (tab === 'inventario') renderInventario()
    })
  })

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function toast(msg, err = false) {
    const t = el.querySelector('#a-toast')
    t.textContent = msg; t.style.background = err ? '#E24B4A' : '#1D9E75'
    t.style.opacity = '1'; setTimeout(() => { t.style.opacity = '0' }, 2800)
  }

  function badge(m) {
    const bg = m >= 25 ? '#E1F5EE' : m >= 15 ? '#FAEEDA' : '#FCEBEB'
    const tc = m >= 25 ? '#085041' : m >= 15 ? '#633806' : '#A32D2D'
    return `<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:${bg};color:${tc};font-weight:500">${m.toFixed(1)}%</span>`
  }

  function kpiCard(label, value, sub, color = '#1F2937', bg = '#fff') {
    return `<div style="background:${bg};border:1px solid #E5E7EB;border-radius:12px;padding:16px">
      <div style="font-size:11px;color:#9CA3AF;font-weight:500;text-transform:uppercase;margin-bottom:6px">${label}</div>
      <div style="font-size:24px;font-weight:700;color:${color}">${value}</div>
      ${sub ? `<div style="font-size:11px;color:#9CA3AF;margin-top:4px">${sub}</div>` : ''}
    </div>`
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────────
  function renderKPIs() {
    const ing    = ventas.reduce((s, v) => s + Number(v.monto), 0)
    const util   = ventas.reduce((s, v) => s + Number(v.utilidad), 0)
    const gOper  = gastos.filter(g => g.categoria !== 'Compra Mercadería').reduce((s, g) => s + Number(g.monto), 0)
    const gMerc  = gastos.filter(g => g.categoria === 'Compra Mercadería').reduce((s, g) => s + Number(g.monto), 0)
    const neta   = util - gOper - gMerc
    const mb     = ing > 0 ? (util / ing * 100).toFixed(1) : 0
    const mn     = ing > 0 ? (neta / ing * 100).toFixed(1) : 0

    el.querySelector('#a-kpis').innerHTML =
      kpiCard('Ingresos totales',    `$${ing.toFixed(2)}`,   `${ventas.length} transacciones`) +
      kpiCard('Utilidad bruta',      `$${util.toFixed(2)}`,  `margen ${mb}%`, '#0F6E56') +
      kpiCard('Compra mercancía',    `$${gMerc.toFixed(2)}`, `costo mercadería`, '#B45309', '#FFFBEB') +
      kpiCard('Gastos operacionales',`$${gOper.toFixed(2)}`, `gastos fijos`, '#A32D2D', '#FFF5F5')

    el.querySelector('#a-kpis2').innerHTML =
      kpiCard('Utilidad neta',       `$${neta.toFixed(2)}`,  `margen neto ${mn}%`, neta >= 0 ? '#0F6E56' : '#A32D2D') +
      kpiCard('Total gastos',        `$${(gOper+gMerc).toFixed(2)}`, `operacional + mercancía`, '#6B7280')
  }

  // ── Productos ─────────────────────────────────────────────────────────────────
  function renderPrecios() {
    const lista = el.querySelector('#a-precios-lista')
    lista.innerHTML = productos.map(p => {
      const m  = p.precio_lb > 0 ? ((p.precio_lb - p.costo_lb) / p.precio_lb * 100) : 0
      const bg = m >= 25 ? '#E1F5EE' : m >= 15 ? '#FAEEDA' : '#FCEBEB'
      const tc = m >= 25 ? '#085041' : m >= 15 ? '#633806' : '#A32D2D'
      const tipoActual = p.tipo || 'granel'
      return `<div style="display:grid;grid-template-columns:1fr 90px 90px 80px 64px 36px;gap:4px;align-items:center;padding:5px 0;border-bottom:1px solid #F3F4F6">
        <span style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.nombre}">${p.nombre}</span>
        <input type="number" step="0.01" min="0" value="${Number(p.precio_lb).toFixed(2)}"
          data-id="${p.id}" data-tipo="precio" oninput="window._precioChange(this)"
          style="padding:4px 6px;border:1px solid #E5E7EB;border-radius:6px;font-size:12px;text-align:right;width:100%">
        <input type="number" step="0.01" min="0" value="${Number(p.costo_lb).toFixed(2)}"
          data-id="${p.id}" data-tipo="costo" oninput="window._precioChange(this)"
          style="padding:4px 6px;border:1px solid #E5E7EB;border-radius:6px;font-size:12px;text-align:right;width:100%">
        <select data-id="${p.id}" onchange="window._tipoChange(this)"
          style="padding:4px 4px;border:1px solid #E5E7EB;border-radius:6px;font-size:11px;width:100%;background:#fff">
          <option value="granel" ${tipoActual==='granel'?'selected':''}>Granel</option>
          <option value="unidad" ${tipoActual==='unidad'?'selected':''}>Unidad</option>
          <option value="mix"    ${tipoActual==='mix'?'selected':''}>Mix</option>
        </select>
        <span id="margen-${p.id}" style="font-size:11px;padding:2px 5px;border-radius:6px;background:${bg};color:${tc};font-weight:500;text-align:center">${m.toFixed(1)}%</span>
        <button onclick="window._borrarProducto(${p.id},'${p.nombre.replace(/'/g, "\'")}')"
          style="padding:3px 7px;background:#FCEBEB;color:#A32D2D;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600" title="Eliminar">×</button>
      </div>`
    }).join('')
  }

  // ── Inventario ────────────────────────────────────────────────────────────────
  let invData = {}

  async function cargarInventario() {
    try {
      const { data } = await supabase.from('inventario').select('*')
      if (data) data.forEach(i => { invData[i.producto_id] = i })
    } catch(e) {}
  }

  function calcSalidas(prodId, prodNombre) {
    return ventas
      .filter(v => v.producto_id === prodId || v.producto_nombre === prodNombre)
      .reduce((s, v) => s + Number(v.gramos), 0)
  }

  async function renderInventario() {
    await cargarInventario()
    const lista = el.querySelector('#inv-lista')
    lista.innerHTML = productos.map((p, i) => {
      const inv    = invData[p.id] || { stock_inicial_g: 0, entradas_g: 0, merma_g: 0 }
      const sal    = calcSalidas(p.id, p.nombre)
      const actual = Number(inv.stock_inicial_g) + Number(inv.entradas_g) - Number(inv.merma_g) - sal
      const estado = actual <= 0
        ? '<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:#FCEBEB;color:#A32D2D;font-weight:500">⛔ Agotado</span>'
        : actual < 500
          ? '<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:#FAEEDA;color:#633806;font-weight:500">⚠ Bajo</span>'
          : '<span style="font-size:11px;padding:2px 8px;border-radius:8px;background:#E1F5EE;color:#085041;font-weight:500">✅ OK</span>'
      const bg = i % 2 === 0 ? '' : 'background:#F9FAFB;'
      return `<div style="display:grid;grid-template-columns:1fr 100px 100px 90px 110px 110px 80px;gap:4px;align-items:center;padding:6px 0;border-bottom:1px solid #F3F4F6;${bg}">
        <span style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.nombre}">${p.nombre}</span>
        <input type="number" min="0" step="1" value="${Number(inv.stock_inicial_g).toFixed(0)}"
          data-pid="${p.id}" data-campo="stock_inicial_g"
          style="padding:4px 6px;border:1px solid #E5E7EB;border-radius:6px;font-size:12px;text-align:right;width:100%">
        <input type="number" min="0" step="1" value="${Number(inv.entradas_g).toFixed(0)}"
          data-pid="${p.id}" data-campo="entradas_g"
          style="padding:4px 6px;border:1px solid #E5E7EB;border-radius:6px;font-size:12px;text-align:right;width:100%">
        <input type="number" min="0" step="1" value="${Number(inv.merma_g).toFixed(0)}"
          data-pid="${p.id}" data-campo="merma_g"
          style="padding:4px 6px;border:1px solid #E5E7EB;border-radius:6px;font-size:12px;text-align:right;width:100%">
        <span style="font-size:12px;text-align:right;color:#A32D2D;font-weight:500;padding-right:4px">${sal.toFixed(1)} g</span>
        <span style="font-size:13px;text-align:right;font-weight:700;color:${actual > 0 ? '#0F6E56' : '#A32D2D'};padding-right:4px">${actual.toFixed(1)} g</span>
        <div style="text-align:center">${estado}</div>
      </div>`
    }).join('')
  }

  // ── Gastos (operacional y mercancía separados) ────────────────────────────────
  function renderGastosMercancia() {
    const merc = gastos.filter(g => g.categoria === 'Compra Mercadería')
    const total = merc.reduce((s, g) => s + Number(g.monto), 0)
    const badge = el.querySelector('#m-total-badge')
    if (badge) badge.textContent = `$${total.toFixed(2)} total`
    const lista = el.querySelector('#m-lista')
    if (!lista) return
    lista.innerHTML = merc.length ? merc.map(g => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F3F4F6">
        <div>
          <div style="font-size:13px;font-weight:500">${g.descripcion || '—'}</div>
          <div style="font-size:11px;color:#9CA3AF">${g.proveedor ? g.proveedor + ' · ' : ''}${g.fecha}${g.comprobante ? ' · #' + g.comprobante : ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:13px;font-weight:600;color:#B45309">$${Number(g.monto).toFixed(2)}</span>
          <button onclick="window._delGasto(${g.id})" style="padding:2px 8px;background:#FCEBEB;color:#A32D2D;border:none;border-radius:6px;font-size:12px;cursor:pointer">×</button>
        </div>
      </div>`).join('')
    : '<div style="text-align:center;padding:20px;color:#9CA3AF;font-size:13px">Sin compras registradas</div>'
  }

  function renderGastosOperacional() {
    const oper = gastos.filter(g => g.categoria !== 'Compra Mercadería')
    const total = oper.reduce((s, g) => s + Number(g.monto), 0)
    const badge = el.querySelector('#g-total-badge')
    if (badge) badge.textContent = `$${total.toFixed(2)} total`
    const lista = el.querySelector('#g-lista')
    if (!lista) return
    lista.innerHTML = oper.length ? oper.map(g => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F3F4F6">
        <div>
          <div style="font-size:13px;font-weight:500">${g.descripcion || g.categoria}</div>
          <div style="font-size:11px;color:#9CA3AF">${g.categoria} · ${g.fecha}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:13px;font-weight:600;color:#A32D2D">$${Number(g.monto).toFixed(2)}</span>
          <button onclick="window._delGasto(${g.id})" style="padding:2px 8px;background:#FCEBEB;color:#A32D2D;border:none;border-radius:6px;font-size:12px;cursor:pointer">×</button>
        </div>
      </div>`).join('')
    : '<div style="text-align:center;padding:20px;color:#9CA3AF;font-size:13px">Sin gastos registrados</div>'
  }

  // ── Rentabilidad por producto ─────────────────────────────────────────────────
  function renderPorProducto() {
    const map = {}
    ventas.forEach(v => {
      if (!map[v.producto_nombre]) map[v.producto_nombre] = { ventas: 0, gramos: 0, util: 0, count: 0 }
      map[v.producto_nombre].ventas += Number(v.monto)
      map[v.producto_nombre].gramos += Number(v.gramos)
      map[v.producto_nombre].util   += Number(v.utilidad)
      map[v.producto_nombre].count  += 1
    })
    const sorted = Object.entries(map).sort((a, b) => b[1].ventas - a[1].ventas)
    const tabla  = el.querySelector('#a-prod-tabla')
    const empty  = el.querySelector('#a-prod-empty')
    const tbody  = el.querySelector('#a-prod-tbody')
    if (!sorted.length) { tabla.classList.add('hidden'); empty.style.display = 'block'; return }
    tabla.classList.remove('hidden'); empty.style.display = 'none'
    tbody.innerHTML = sorted.map(([n, d]) => {
      const m = d.ventas > 0 ? d.util / d.ventas * 100 : 0
      return `<tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:8px 6px;font-weight:500">${n}</td>
        <td style="padding:8px 6px;text-align:right">$${d.ventas.toFixed(2)}</td>
        <td style="padding:8px 6px;text-align:right">${d.gramos.toFixed(1)} g</td>
        <td style="padding:8px 6px;text-align:right;color:#0F6E56">$${d.util.toFixed(2)}</td>
        <td style="padding:8px 6px;text-align:right">${badge(m)}</td>
        <td style="padding:8px 6px;text-align:right;color:#9CA3AF">${d.count}</td>
      </tr>`
    }).join('')
  }

  // ── Historial ventas ──────────────────────────────────────────────────────────
  function renderHistorial() {
    const tabla = el.querySelector('#a-hist-tabla')
    const empty = el.querySelector('#a-hist-empty')
    const tbody = el.querySelector('#a-hist-tbody')
    if (!ventas.length) { tabla.classList.add('hidden'); empty.style.display = 'block'; return }
    tabla.classList.remove('hidden'); empty.style.display = 'none'
    tbody.innerHTML = ventas.map(v => {
      const m = Number(v.margen) * 100
      return `<tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:8px 6px">${v.fecha}</td>
        <td style="padding:8px 6px">${v.vendedor}</td>
        <td style="padding:8px 6px;color:#9CA3AF">${v.turno}</td>
        <td style="padding:8px 6px;font-weight:500">${v.producto_nombre}</td>
        <td style="padding:8px 6px;text-align:right">$${Number(v.monto).toFixed(2)}</td>
        <td style="padding:8px 6px;text-align:right;color:#0F6E56;font-weight:600">${Number(v.gramos).toFixed(1)} g</td>
        <td style="padding:8px 6px;text-align:right;color:#0F6E56">$${Number(v.utilidad).toFixed(2)}</td>
        <td style="padding:8px 6px;text-align:right">${badge(m)}</td>
        <td style="padding:8px 4px;text-align:right">
          <button onclick="window._delVentaAdmin(${v.id},'${String(v.producto_nombre).replace(/'/g,"\'")}')"
            style="padding:3px 8px;background:#FCEBEB;color:#A32D2D;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600">×</button>
        </td>
      </tr>`
    }).join('')
  }

  function renderTodo() {
    renderKPIs(); renderPorProducto(); renderHistorial()
    renderGastosMercancia(); renderGastosOperacional()
  }

  // ── Carga inicial ─────────────────────────────────────────────────────────────
  async function cargar() {
    try {
      ;[productos, ventas, gastos] = await Promise.all([
        getProductos(),
        getVentas(filtroDesde, filtroHasta),
        getGastos(filtroDesde, filtroHasta)
      ])
      renderPrecios(); renderTodo()
    } catch(e) { toast('Error al cargar datos', true) }
  }

  // ── Eventos ───────────────────────────────────────────────────────────────────
  el.querySelector('#a-filtrar').addEventListener('click', async () => {
    filtroDesde = el.querySelector('#a-desde').value
    filtroHasta = el.querySelector('#a-hasta').value
    await cargar()
  })

  el.querySelector('#a-logout').addEventListener('click', onLogout)

  // Nuevo producto
  el.querySelector('#a-nuevo-producto').addEventListener('click', () => {
    const form = el.querySelector('#a-form-nuevo')
    form.style.display = form.style.display === 'none' ? 'block' : 'none'
    if (form.style.display === 'block') el.querySelector('#nuevo-nombre').focus()
  })
  el.querySelector('#a-cancelar-nuevo').addEventListener('click', () => {
    el.querySelector('#a-form-nuevo').style.display = 'none'
    el.querySelector('#nuevo-nombre').value = ''
    el.querySelector('#nuevo-precio').value = ''
    el.querySelector('#nuevo-costo').value = ''
  })
  el.querySelector('#a-confirmar-nuevo').addEventListener('click', async () => {
    const nombre = el.querySelector('#nuevo-nombre').value.trim().toUpperCase()
    const precio = parseFloat(el.querySelector('#nuevo-precio').value)
    const costo  = parseFloat(el.querySelector('#nuevo-costo').value)
    if (!nombre) { toast('Escribe el nombre', true); return }
    if (isNaN(precio) || precio <= 0) { toast('Precio inválido', true); return }
    if (isNaN(costo) || costo <= 0) { toast('Costo inválido', true); return }
    if (costo >= precio) { toast('El costo debe ser menor al precio', true); return }
    const btn = el.querySelector('#a-confirmar-nuevo')
    btn.disabled = true; btn.textContent = 'Guardando...'
    try {
      const { data, error } = await supabase.from('productos').insert({ nombre, precio_lb: precio, costo_lb: costo, activo: true }).select().single()
      if (error) throw error
      productos.push(data); productos.sort((a, b) => a.nombre.localeCompare(b.nombre))
      renderPrecios()
      el.querySelector('#a-form-nuevo').style.display = 'none'
      el.querySelector('#nuevo-nombre').value = ''
      el.querySelector('#nuevo-precio').value = ''
      el.querySelector('#nuevo-costo').value = ''
      toast(`✅ ${nombre} agregado`)
    } catch(e) {
      toast(e.message?.includes('unique') ? 'Ya existe ese producto' : 'Error al agregar', true)
    } finally { btn.disabled = false; btn.textContent = 'Agregar' }
  })
  el.querySelector('#nuevo-nombre').addEventListener('keydown', e => { if (e.key === 'Enter') el.querySelector('#nuevo-precio').focus() })
  el.querySelector('#nuevo-precio').addEventListener('keydown', e => { if (e.key === 'Enter') el.querySelector('#nuevo-costo').focus() })
  el.querySelector('#nuevo-costo').addEventListener('keydown', e => { if (e.key === 'Enter') el.querySelector('#a-confirmar-nuevo').click() })

  // Guardar precios
  el.querySelector('#a-guardar-precios').addEventListener('click', async () => {
    const btn = el.querySelector('#a-guardar-precios')
    btn.disabled = true; btn.textContent = 'Guardando...'
    try {
      await Promise.all(productos.map(p => updateProducto(p.id, p.precio_lb, p.costo_lb)))
      toast('Precios actualizados')
    } catch(e) { toast('Error al guardar', true) }
    finally { btn.disabled = false; btn.textContent = 'Guardar cambios' }
  })

  // Guardar inventario
  el.querySelector('#inv-guardar').addEventListener('click', async () => {
    const btn = el.querySelector('#inv-guardar')
    btn.disabled = true; btn.textContent = 'Guardando...'
    const inputs = el.querySelector('#inv-lista').querySelectorAll('input[data-pid]')
    const changes = {}
    inputs.forEach(inp => {
      const pid = parseInt(inp.dataset.pid)
      if (!changes[pid]) changes[pid] = {}
      changes[pid][inp.dataset.campo] = parseFloat(inp.value) || 0
    })
    try {
      await Promise.all(Object.entries(changes).map(([pid, campos]) =>
        supabase.from('inventario').upsert({ producto_id: parseInt(pid), ...campos }, { onConflict: 'producto_id' })
      ))
      await cargarInventario()
      await renderInventario()
      const msg = el.querySelector('#inv-msg')
      msg.textContent = '✅ Inventario guardado correctamente'
      msg.style.cssText = 'display:block;padding:8px 12px;border-radius:8px;font-size:13px;font-weight:500;background:#E1F5EE;color:#085041'
      setTimeout(() => { msg.style.display = 'none' }, 2500)
    } catch(e) {
      toast('Error al guardar inventario', true)
    } finally { btn.disabled = false; btn.textContent = 'Guardar stock' }
  })

  // Registrar compra mercancía
  el.querySelector('#m-registrar').addEventListener('click', async () => {
    const monto = parseFloat(el.querySelector('#m-monto').value)
    if (isNaN(monto) || monto <= 0) { toast('Ingresa un monto válido', true); return }
    try {
      const nuevo = await insertGasto({
        fecha:        el.querySelector('#m-fecha').value || hoy,
        categoria:    'Compra Mercadería',
        descripcion:  el.querySelector('#m-desc').value,
        proveedor:    el.querySelector('#m-prov').value,
        monto,
        comprobante:  el.querySelector('#m-comprobante').value
      })
      gastos.unshift(nuevo)
      el.querySelector('#m-desc').value = ''
      el.querySelector('#m-monto').value = ''
      el.querySelector('#m-prov').value = ''
      el.querySelector('#m-comprobante').value = ''
      renderGastosMercancia(); renderKPIs()
      toast('Compra registrada')
    } catch(e) { toast('Error al registrar', true) }
  })

  // Registrar gasto operacional
  el.querySelector('#g-fecha').value = hoy
  el.querySelector('#m-fecha').value = hoy
  el.querySelector('#g-registrar').addEventListener('click', async () => {
    const monto = parseFloat(el.querySelector('#g-monto').value)
    if (isNaN(monto) || monto <= 0) { toast('Ingresa un monto válido', true); return }
    try {
      const nuevo = await insertGasto({
        fecha:       el.querySelector('#g-fecha').value || hoy,
        categoria:   el.querySelector('#g-cat').value,
        descripcion: el.querySelector('#g-desc').value,
        monto
      })
      gastos.unshift(nuevo)
      el.querySelector('#g-desc').value = ''
      el.querySelector('#g-monto').value = ''
      renderGastosOperacional(); renderKPIs()
      toast('Gasto registrado')
    } catch(e) { toast('Error al registrar', true) }
  })

  // Exportar CSV
  el.querySelector('#a-exportar').addEventListener('click', () => {
    if (!ventas.length) { toast('Sin ventas para exportar', true); return }
    const rows = ['Fecha,Vendedor,Turno,Producto,Monto,Gramos,Utilidad,Margen%',
      ...ventas.map(v => `${v.fecha},${v.vendedor},${v.turno},${v.producto_nombre},${Number(v.monto).toFixed(2)},${Number(v.gramos).toFixed(1)},${Number(v.utilidad).toFixed(2)},${(Number(v.margen)*100).toFixed(1)}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `ventas_${filtroDesde}_${filtroHasta}.csv`; a.click()
    toast('Exportando...')
  })

  // Cambio precio en vivo
  window._precioChange = (input) => {
    const id = parseInt(input.dataset.id), tipo = input.dataset.tipo, val = parseFloat(input.value) || 0
    const prod = productos.find(p => p.id === id)
    if (!prod) return
    if (tipo === 'precio') prod.precio_lb = val; else prod.costo_lb = val
    const m = prod.precio_lb > 0 ? ((prod.precio_lb - prod.costo_lb) / prod.precio_lb * 100) : 0
    const bg = m >= 25 ? '#E1F5EE' : m >= 15 ? '#FAEEDA' : '#FCEBEB'
    const tc = m >= 25 ? '#085041' : m >= 15 ? '#633806' : '#A32D2D'
    const b = document.getElementById(`margen-${id}`)
    if (b) { b.textContent = m.toFixed(1) + '%'; b.style.background = bg; b.style.color = tc }
  }

  window._tipoChange = async (select) => {
    const id  = parseInt(select.dataset.id)
    const val = select.value
    const prod = productos.find(p => p.id === id)
    if (!prod) return
    prod.tipo = val
    try {
      await supabase.from('productos').update({ tipo: val }).eq('id', id)
      toast('Tipo actualizado')
    } catch(e) { toast('Error al actualizar tipo', true) }
  }

  window._borrarProducto = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    try {
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      productos = productos.filter(p => p.id !== id); renderPrecios(); toast(`${nombre} eliminado`)
    } catch(e) { toast('Error al eliminar', true) }
  }

  window._delGasto = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      await deleteGasto(id); gastos = gastos.filter(g => g.id !== id)
      renderGastosMercancia(); renderGastosOperacional(); renderKPIs()
      toast('Eliminado')
    } catch(e) { toast('Error al eliminar', true) }
  }

  window._delVentaAdmin = async (id, nombre) => {
    if (!confirm(`¿Eliminar la venta de "${nombre}"?`)) return
    try {
      await deleteVenta(id); ventas = ventas.filter(v => v.id !== id); renderTodo(); toast('Venta eliminada')
    } catch(e) { toast('Error al eliminar', true) }
  }

  subscribeVentas(async () => { ventas = await getVentas(filtroDesde, filtroHasta); renderTodo() })

  await cargar()
  return el
}
