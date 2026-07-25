# Catálogo Digital para Instagram

Catálogo de roupas com carrinho e pedido enviado direto para o WhatsApp da loja.

## Como funciona

1. Cliente clica no link do seu Instagram → abre o catálogo.
2. Ele navega pelas peças e clica em **Adicionar** nas que quiser.
3. Vai até o **carrinho** (ícone de sacola no topo), confere os itens e quantidades.
4. Clica em **Enviar pedido no WhatsApp** → abre o WhatsApp da loja já com a lista de produtos e o total.
5. Você (vendedor) confirma, envia a chave PIX, recebe o comprovante e despacha o pedido.

O painel administrativo (`/admin`) permite cadastrar produtos, colocar fotos e preços, editar
textos da loja e trocar o número de WhatsApp — tudo sem mexer no código.

## Rodando localmente

```bash
python3 -m venv venv
source venv/bin/activate   # no Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Acesse:
- Catálogo: http://localhost:5000
- Painel admin: http://localhost:5000/admin/login (usuário `admin`, senha `admin123`)

**Troque a senha padrão assim que entrar**, em Configurações.

## Primeiros passos no painel

1. Entre em `/admin/login`.
2. Vá em **Configurações** e preencha:
   - Nome da loja
   - Texto de boas-vindas
   - Número de WhatsApp (formato: código do país + DDD + número, só dígitos — ex: `5534999999999` para um número de Minas Gerais)
   - Nova senha do painel
3. Vá em **Produtos → Novo produto** e cadastre suas peças com foto, preço, tamanhos e categoria.

## Colocando no ar (para usar o link no Instagram)

Este projeto roda localmente por padrão. Para ter um link público (ex: `https://sualoja.up.railway.app`)
para colocar no Instagram, publique em um serviço de hospedagem. Opções simples e com plano gratuito:

- **Render** (render.com) — mais indicado para iniciantes com Flask.
- **Railway** (railway.app)
- **PythonAnywhere** (pythonanywhere.com)

Passos gerais (variam um pouco por serviço):
1. Crie uma conta no serviço escolhido.
2. Suba este projeto (via GitHub ou upload direto).
3. Configure o comando de start como `gunicorn app:app` (adicione `gunicorn` ao `requirements.txt`
   antes de publicar: `pip install gunicorn` e depois `pip freeze > requirements.txt`, ou simplesmente
   adicione a linha `gunicorn` no arquivo).
4. Defina a variável de ambiente `SECRET_KEY` com um valor aleatório seguro.
5. Após publicar, copie a URL gerada e cole no campo de link da bio do Instagram.

**Importante:** o banco de dados usado aqui é SQLite (arquivo `catalogo.db`, criado automaticamente).
Em hospedagens gratuitas o disco pode ser reiniciado a cada deploy, apagando os produtos cadastrados.
Se isso acontecer com o serviço escolhido, pode ser necessário migrar para um banco Postgres gratuito
(a maioria dessas plataformas oferece um) — posso te ajudar com esse ajuste quando for a hora.

## Estrutura do projeto

```
catalogo-roupas/
├── app.py                  # rotas, modelos e lógica
├── requirements.txt
├── static/
│   ├── css/style.css
│   └── uploads/             # fotos dos produtos
└── templates/
    ├── base.html / index.html / cart.html
    └── admin/                # login, dashboard, formulário de produto, configurações
```
