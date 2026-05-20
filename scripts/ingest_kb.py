#!/usr/bin/env python3
"""
Ingest dos MDs em kb/ para a tabela kb_chunks no Supabase.

Fluxo:
  1. Lê cada .md em kb/ (exceto README.md), parseia frontmatter
  2. Divide por headings H2 — cada H2 vira um chunk
  3. Gera embedding via Gemini text-embedding-004 (768 dims)
  4. Upsert na tabela kb_chunks (chave: source_file + section_title)

Pré-requisitos:
  - Schema aplicado: supabase/schema.sql rodado no SQL Editor
  - .env na raiz do repo com:
      SUPABASE_URL=https://xxx.supabase.co
      SUPABASE_SERVICE_ROLE_KEY=eyJ...
      GEMINI_API_KEY=AIzaSy...

Uso:
  cd /caminho/do/repo
  python3 scripts/ingest_kb.py            # ingere tudo
  python3 scripts/ingest_kb.py --dry-run  # só mostra o que faria
  python3 scripts/ingest_kb.py --file beneficios.md  # só um arquivo
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("Falta `requests`. Rode: pip install --user --break-system-packages requests python-frontmatter", file=sys.stderr)
    sys.exit(1)

try:
    import frontmatter
except ImportError:
    print("Falta `python-frontmatter`. Rode: pip install --user --break-system-packages python-frontmatter", file=sys.stderr)
    sys.exit(1)


REPO_ROOT = Path(__file__).resolve().parent.parent
KB_DIR = REPO_ROOT / "kb"
ENV_PATH = REPO_ROOT / ".env"


def load_env(path: Path) -> dict[str, str]:
    """Lê .env simples (KEY=VALUE por linha). Sem dependência externa."""
    env = dict(os.environ)
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def chunk_markdown(md_path: Path) -> list[dict]:
    """Lê um .md e retorna lista de chunks (um por H2)."""
    post = frontmatter.load(md_path)
    meta = post.metadata
    body = post.content

    # Split em ## (início de linha). Mantém o ## no chunk.
    parts = re.split(r"\n(?=## )", body)

    chunks = []
    for part in parts:
        part = part.strip()
        if not part.startswith("## "):
            continue  # lead/intro antes do primeiro H2: ignora
        title_match = re.match(r"## (.+)", part)
        if not title_match:
            continue
        title = title_match.group(1).strip()
        chunks.append({
            "source_file": md_path.name,
            "category": meta.get("category", "uncategorized"),
            "audience": meta.get("audience", "colaborador"),
            "section_title": title,
            "content": part,
            "token_count": max(1, len(part) // 4),  # estimativa rasa
            "metadata": {
                "title": meta.get("title"),
                "source_pdf": meta.get("source_pdf"),
                "source_pages": meta.get("source_pages"),
                "last_updated": str(meta.get("last_updated")) if meta.get("last_updated") else None,
            },
        })
    return chunks


def embed_text(text: str, gemini_key: str, retries: int = 3) -> list[float]:
    """Gera embedding via Gemini text-embedding-004 (768 dims)."""
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"text-embedding-004:embedContent?key={gemini_key}"
    )
    payload = {
        "model": "models/text-embedding-004",
        "content": {"parts": [{"text": text}]},
    }
    for attempt in range(1, retries + 1):
        try:
            r = requests.post(url, json=payload, timeout=30)
            if r.status_code == 429:
                wait = 2 ** attempt
                print(f"    rate limit, aguardando {wait}s...", file=sys.stderr)
                time.sleep(wait)
                continue
            r.raise_for_status()
            return r.json()["embedding"]["values"]
        except requests.RequestException as e:
            if attempt == retries:
                raise
            print(f"    erro embed (tentativa {attempt}/{retries}): {e}", file=sys.stderr)
            time.sleep(2 * attempt)
    raise RuntimeError("embed_text falhou após retries")


def upsert_chunk(chunk: dict, embedding: list[float], supabase_url: str, service_key: str) -> None:
    """Upsert em kb_chunks via Supabase REST API. Chave de conflito: source_file+section_title."""
    url = f"{supabase_url}/rest/v1/kb_chunks"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    body = {
        "source_file": chunk["source_file"],
        "category": chunk["category"],
        "audience": chunk["audience"],
        "section_title": chunk["section_title"],
        "content": chunk["content"],
        "token_count": chunk["token_count"],
        "embedding": embedding,
        "metadata": chunk["metadata"],
    }
    # on_conflict precisa bater com a constraint UNIQUE da tabela
    params = {"on_conflict": "source_file,section_title"}
    r = requests.post(url, headers=headers, params=params, json=body, timeout=30)
    if r.status_code >= 300:
        raise RuntimeError(f"Upsert falhou ({r.status_code}): {r.text}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Não chama Gemini nem Supabase; só mostra os chunks")
    parser.add_argument("--file", help="Processa apenas um arquivo específico (nome dentro de kb/)")
    parser.add_argument("--sleep", type=float, default=0.1, help="Pausa entre embeddings (segundos)")
    args = parser.parse_args()

    env = load_env(ENV_PATH)
    supabase_url = env.get("SUPABASE_URL", "").rstrip("/")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    gemini_key = env.get("GEMINI_API_KEY", "")

    if not args.dry_run:
        missing = [k for k, v in {
            "SUPABASE_URL": supabase_url,
            "SUPABASE_SERVICE_ROLE_KEY": service_key,
            "GEMINI_API_KEY": gemini_key,
        }.items() if not v]
        if missing:
            print(f"ERRO: variáveis ausentes no .env: {', '.join(missing)}", file=sys.stderr)
            sys.exit(2)

    files = sorted(KB_DIR.glob("*.md"))
    files = [f for f in files if f.name != "README.md"]
    if args.file:
        files = [f for f in files if f.name == args.file]
        if not files:
            print(f"ERRO: arquivo {args.file} não encontrado em {KB_DIR}", file=sys.stderr)
            sys.exit(2)

    total_chunks = 0
    for md_path in files:
        chunks = chunk_markdown(md_path)
        print(f"\n>>> {md_path.name}: {len(chunks)} chunks")
        for chunk in chunks:
            title = chunk["section_title"]
            preview = chunk["content"][:60].replace("\n", " ")
            if args.dry_run:
                print(f"    [{chunk['category']}/{chunk['audience']}] {title}")
                print(f"        {preview}...")
                continue
            print(f"    embed: {title}")
            emb = embed_text(chunk["content"], gemini_key)
            upsert_chunk(chunk, emb, supabase_url, service_key)
            total_chunks += 1
            if args.sleep > 0:
                time.sleep(args.sleep)
        if args.dry_run:
            total_chunks += len(chunks)

    mode = "DRY-RUN" if args.dry_run else "INGERIDOS"
    print(f"\n{mode}: {total_chunks} chunks no total ({len(files)} arquivos)")


if __name__ == "__main__":
    main()
