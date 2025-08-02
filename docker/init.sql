-- データベース初期化SQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Todosテーブルの作成
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーの作成
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入
INSERT INTO todos (title, description, completed) VALUES
    ('oRPCの設定を完了する', 'oRPCサーバーとクライアントの基本設定を実装', TRUE),
    ('UIコンポーネントを作成する', 'Tailwind CSSを使用して基本的なUIコンポーネントを実装', FALSE),
    ('データベース統合をテストする', 'PostgreSQLとの接続が正常に動作することを確認', FALSE);