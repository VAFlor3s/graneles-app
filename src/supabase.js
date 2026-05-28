import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('=== DEBUG ===')
console.log('URL:', url)
console.log('KEY:', key ? key.substring(0,30)+'...' : 'VACÍA')

export const supabase = createClient(url, key, {
  auth: { persistSession: false }
})

export const LB = 453.592

export async function getProductos() {
  // Sin filtro de activo — trae todos los productos
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre')
  if (error) { console.error('Error productos:', error); throw error }
  console.log('Productos cargados:', data?.length)
  return data
}

export async function updateProducto(id, precio_lb, costo_lb) {
  const { error } = await supabase
    .from('productos').update({ precio_lb, costo_lb }).eq('id', id)
  if (error) throw error
}

export async function getVentas(desde, hasta) {
  let q = supabase.from('ventas').select('*').order('created_at', { ascending: false })
  if (desde) q = q.gte('fecha', desde)
  if (hasta) q = q.lte('fecha', hasta)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function insertVenta(venta) {
  const { data, error } = await supabase.from('ventas').insert(venta).select().single()
  if (error) throw error
  return data
}

export async function deleteVenta(id) {
  const { error } = await supabase.from('ventas').delete().eq('id', id)
  if (error) throw error
}

export async function getGastos(desde, hasta) {
  let q = supabase.from('gastos').select('*').order('fecha', { ascending: false })
  if (desde) q = q.gte('fecha', desde)
  if (hasta) q = q.lte('fecha', hasta)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function insertGasto(gasto) {
  const { data, error } = await supabase.from('gastos').insert(gasto).select().single()
  if (error) throw error
  return data
}

export async function deleteGasto(id) {
  const { error } = await supabase.from('gastos').delete().eq('id', id)
  if (error) throw error
}

export function subscribeVentas(callback) {
  return supabase.channel('ventas-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ventas' }, callback)
    .subscribe()
}

export function subscribeProductos(callback) {
  return supabase.channel('productos-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, callback)
    .subscribe()
}
