-- ══════════════════════════════════════════════════════════════════
-- FRUTOS SECOS AL GRANEL — Supabase Schema
-- Instrucciones: Supabase → SQL Editor → New query → pega todo → Run
-- ══════════════════════════════════════════════════════════════════

-- 1. TABLA DE PRODUCTOS Y PRECIOS
create table if not exists productos (
  id          serial primary key,
  nombre      text not null unique,
  precio_lb   numeric(10,4) not null default 0,
  costo_lb    numeric(10,4) not null default 0,
  activo      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. TABLA DE VENTAS
create table if not exists ventas (
  id              serial primary key,
  fecha           date not null default current_date,
  vendedor        text not null,
  turno           text not null check (turno in ('Mañana','Tarde','Noche')),
  producto_id     integer references productos(id),
  producto_nombre text not null,
  monto           numeric(10,2) not null,
  precio_gr       numeric(10,6) not null,
  costo_gr        numeric(10,6) not null,
  gramos          numeric(10,2) not null,
  utilidad        numeric(10,2) not null,
  margen          numeric(6,4) not null,
  created_at      timestamptz default now()
);

-- 3. TABLA DE GASTOS
create table if not exists gastos (
  id          serial primary key,
  fecha       date not null default current_date,
  categoria   text not null,
  descripcion text,
  proveedor   text,
  monto       numeric(10,2) not null,
  comprobante text,
  created_at  timestamptz default now()
);

-- 4. TABLA DE INVENTARIO
create table if not exists inventario (
  id              serial primary key,
  producto_id     integer references productos(id) unique,
  stock_inicial_g numeric(12,2) default 0,
  entradas_g      numeric(12,2) default 0,
  merma_g         numeric(12,2) default 0,
  updated_at      timestamptz default now()
);

-- 5. SEGURIDAD (Row Level Security)
alter table productos  enable row level security;
alter table ventas     enable row level security;
alter table gastos     enable row level security;
alter table inventario enable row level security;

create policy "acceso publico productos"  on productos  for all using (true);
create policy "acceso publico ventas"     on ventas     for all using (true);
create policy "acceso publico gastos"     on gastos     for all using (true);
create policy "acceso publico inventario" on inventario for all using (true);

-- 6. FUNCIÓN: actualizar updated_at automáticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger productos_updated_at
  before update on productos
  for each row execute function update_updated_at();

create trigger inventario_updated_at
  before update on inventario
  for each row execute function update_updated_at();

-- 7. DATOS INICIALES — 57 productos con precios y costos
insert into productos (nombre, precio_lb, costo_lb) values
  ('AJO EN POLVO',        5.50,  3.80),
  ('AJONJOLI',            3.20,  2.10),
  ('ALMENDRA',            9.50,  6.80),
  ('AMARANTO',            4.80,  3.20),
  ('AMARANTO POP',        5.20,  3.50),
  ('ANIS ESPAÑOL',        4.00,  2.60),
  ('ANIS ESTRELLADO',     6.50,  4.30),
  ('ARANDANO',           12.00,  8.50),
  ('ARROZ DULCE',         2.80,  1.80),
  ('AVELLANA',           11.00,  7.80),
  ('AVENA HOJUELA',       2.50,  1.50),
  ('CAFÉ MOLIDO',         8.00,  5.50),
  ('CANELA TUBO',         5.00,  3.20),
  ('CEBOLLA POLVO',       5.20,  3.40),
  ('CHIA',                4.50,  2.90),
  ('CHISPAS CHOCOLATE',   6.00,  4.00),
  ('CHOCOPASAS',          5.50,  3.60),
  ('CHOCOPASAS BLANCA',   6.00,  4.00),
  ('CIRUELA',             5.80,  3.90),
  ('CLAVO DE OLOR',       7.00,  4.80),
  ('COCO RALLADO',        4.20,  2.70),
  ('COCO TOSTADO',        4.50,  2.90),
  ('COMINO',              5.00,  3.30),
  ('CROCANTICOS',         5.50,  3.60),
  ('CURCUMA',             6.00,  4.00),
  ('DATILES',             8.50,  6.00),
  ('FLOR DE JAMAICA',     5.50,  3.60),
  ('FRUTA DESH. GRD.',    7.00,  4.80),
  ('FRUTA DESH. PEQ.',    6.50,  4.40),
  ('GOTAS DE CHOCOLATE',  6.50,  4.30),
  ('GRANOLA',             4.00,  2.60),
  ('LAUREL HOJA',         3.50,  2.20),
  ('LINAZA',              3.00,  1.90),
  ('MACA',                9.00,  6.20),
  ('MACADAMIA',          16.00, 11.50),
  ('MANI DULCE',          3.50,  2.20),
  ('MANI JAPONES',        4.00,  2.60),
  ('MANI TOSTADO',        3.50,  2.20),
  ('MANICRIS',            4.50,  2.90),
  ('MIEL ABEJA GRD',      7.00,  4.80),
  ('MIEL ABEJA PEQ',      7.50,  5.10),
  ('MORA DESHIDRATADA',  10.00,  7.00),
  ('NUECES',             13.00,  9.20),
  ('OREGANO',             4.50,  2.90),
  ('PALILLOS CHOCOLATE',  6.00,  4.00),
  ('PANELA MOLIDA',       2.50,  1.50),
  ('PASAS',               4.00,  2.60),
  ('PEPA ZAMBO',          5.50,  3.70),
  ('PIMIENTA NEGRA G.',   6.50,  4.30),
  ('PIMIENTA DULCE',      6.00,  4.00),
  ('PIMIENTA NEGRA MO.',  6.50,  4.30),
  ('PISTACHOS',          18.00, 13.00),
  ('QUINUA POP',          5.00,  3.30),
  ('SAL ROSADA GRANO',    3.50,  2.20),
  ('SAL ROSADA MOLIDA',   3.80,  2.40),
  ('STEVIA',             15.00, 10.50),
  ('TE VERDE',            8.00,  5.50)
on conflict (nombre) do nothing;

-- 8. Poblar inventario con todos los productos (stock en 0 para que lo ingreses tú)
insert into inventario (producto_id, stock_inicial_g, entradas_g, merma_g)
select id, 0, 0, 0 from productos
on conflict (producto_id) do nothing;

-- ══════════════════════════════════════════════════════════════════
-- LISTO. Deberías ver "Success. No rows returned" al ejecutar.
-- Verifica en Table Editor que existen las tablas:
--   productos (57 filas), ventas (0), gastos (0), inventario (57)
-- ══════════════════════════════════════════════════════════════════
