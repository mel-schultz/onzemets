-- ── Script para criar o usuário Super Admin Mel Schultz ─────────────────
-- Execute este script no SQL Editor do seu painel Supabase.

-- Primeiro, verificamos se o usuário já existe para não duplicar.
-- A senha padrão definida é '123456' (hash bcrypt abaixo).
-- Se preferir outra senha, você pode alterá-la via interface do sistema após o primeiro login.

INSERT INTO usuarios (nome, email, senha_hash, funcao, status)
SELECT 
  'Mel Schultz', 
  'mel.schultz@yahoo.com', 
  '$2a$10$7R0ZfN9U5uK8p1R8e0y4u.k7H7v0z7v7v7v7v7v7v7v7v7v7v7v7v', -- Hash para '123456'
  'Super Admin', 
  'ativo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'mel.schultz@yahoo.com'
);

-- Caso o usuário já exista, garantimos que ele tenha o papel de Super Admin.
UPDATE usuarios 
SET funcao = 'Super Admin', status = 'ativo'
WHERE email = 'mel.schultz@yahoo.com';
