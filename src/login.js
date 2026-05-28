export function renderLogin(onLogin) {
  const adminPin    = import.meta.env.VITE_ADMIN_PIN    || '1234'
  const vendedorPin = import.meta.env.VITE_VENDEDOR_PIN || '5678'

  const el = document.createElement('div')
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F9FAFB">
      <div style="background:#fff;border-radius:12px;border:1px solid #E5E7EB;padding:40px;width:380px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:40px;margin-bottom:10px">🌰</div>
          <h1 style="font-size:20px;font-weight:600;color:#1F2937;margin-bottom:4px">VAFlor3s's Nuts</h1>
          <p style="font-size:13px;color:#9CA3AF">Sistema de ventas al granel</p>
        </div>

        <div style="margin-bottom:14px">
          <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:5px">Tu nombre</label>
          <input id="login-nombre" type="text" placeholder="Ej: Yuli"
            style="width:100%;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:14px;outline:none;transition:border-color .15s"
            onfocus="this.style.borderColor='#1D9E75'" onblur="this.style.borderColor='#E5E7EB'">
        </div>

        <div style="margin-bottom:22px">
          <label style="font-size:12px;color:#4B5563;font-weight:500;display:block;margin-bottom:5px">PIN de acceso</label>
          <input id="login-pin" type="password" placeholder="••••••" maxlength="8"
            style="width:100%;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:20px;letter-spacing:8px;text-align:center;outline:none;transition:border-color .15s"
            onfocus="this.style.borderColor='#1D9E75'" onblur="this.style.borderColor='#E5E7EB'">
        </div>

        <button id="login-btn"
          style="width:100%;padding:11px;background:#1D9E75;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;transition:background .15s"
          onmouseover="this.style.background='#0F6E56'" onmouseout="this.style.background='#1D9E75'">
          Ingresar
        </button>

        <div id="login-error"
          style="display:none;margin-top:12px;padding:10px 14px;background:#FCEBEB;color:#A32D2D;border-radius:8px;font-size:13px;text-align:center">
          PIN incorrecto. Intenta de nuevo.
        </div>
      </div>
    </div>`

  const btn    = el.querySelector('#login-btn')
  const pinEl  = el.querySelector('#login-pin')
  const errEl  = el.querySelector('#login-error')
  const nomEl  = el.querySelector('#login-nombre')

  const intentar = () => {
    const pin = pinEl.value.trim()
    const nom = nomEl.value.trim() || 'Usuario'
    errEl.style.display = 'none'
    if (pin === adminPin)    onLogin('admin', nom)
    else if (pin === vendedorPin) onLogin('vendedor', nom)
    else { errEl.style.display = 'block'; pinEl.value = ''; pinEl.focus() }
  }

  btn.addEventListener('click', intentar)
  pinEl.addEventListener('keydown', e => { if (e.key === 'Enter') intentar() })
  nomEl.addEventListener('keydown', e => { if (e.key === 'Enter') pinEl.focus() })

  return el
}
