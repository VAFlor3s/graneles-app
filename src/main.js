import { renderLogin }    from './login.js'
import { renderVendedor } from './vendedor.js'
import { renderAdmin }    from './admin.js'

const app = document.getElementById('app')

function showLogin() {
  app.innerHTML = ''
  app.appendChild(renderLogin(async (rol, nombre) => {
    app.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;gap:12px">
        <div style="width:20px;height:20px;border:2px solid #1D9E75;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>
        <span style="font-size:14px;color:#9CA3AF">Cargando...</span>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`
    const panel = rol === 'admin'
      ? await renderAdmin(nombre, showLogin)
      : await renderVendedor(nombre, showLogin)
    app.innerHTML = ''
    app.appendChild(panel)
  }))
}

showLogin()
