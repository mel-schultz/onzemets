-- ── Script Final para Criar o Super Admin Mel Schultz ─────────────────
-- Execute este script no SQL Editor do seu painel Supabase.

-- Este script garante que o usuário exista com o hash de senha bcrypt correto.
-- Senha definida: 123456

DO $$
BEGIN
    -- Se o usuário não existe, insere um novo
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'mel.schultz@yahoo.com') THEN
        INSERT INTO usuarios (nome, email, senha_hash, funcao, status)
        VALUES (
            'Mel Schultz', 
            'mel.schultz@yahoo.com', 
            '$2b$10$W4YqArb69WG4b//LWMcf..0MeRXWs6yDfXxQK5WA6syrqEOveaavK', -- Hash verificado para '123456'
            'Super Admin', 
            'ativo'
        );
    ELSE
        -- Se o usuário já existe, atualiza para garantir o papel de Super Admin e a senha correta
        UPDATE usuarios 
        SET 
            nome = 'Mel Schultz',
            funcao = 'Super Admin', 
            status = 'ativo',
            senha_hash = '$2b$10$W4YqArb69WG4b//LWMcf..0MeRXWs6yDfXxQK5WA6syrqEOveaavK'
        WHERE email = 'mel.schultz@yahoo.com';
    END IF;
END $$;
