---
title: "# Spotlight su un NAS fatto in casa: Samba + Manticore Search su Proxmox LXC"
description: Permettere a spotlight di interrogare il contenuto di una condivisione samba con due containers e manticore
pubDatetime: 2026-04-12
ogImage: /assets/samba-spotlight-manticore.webp
tags:
  - Linux
  - Container
  - Samba
  - Spotlight
  - proxmox
---
## Parte 1 — Il percorso

### L'obiettivo

Ho un NAS costruito su Proxmox con container LXC. L'idea era semplice: condividere file via Samba e poterli cercare dal Finder di macOS come se fossero su un disco locale, usando Spotlight. Cercare "Battiato" e trovare tutti gli MP3, i PDF, i file di testo — tutto indicizzato, tutto raggiungibile in un secondo.

Samba supporta il protocollo Spotlight di Apple dalla versione 4.x, con un'opzione chiamata `spotlight backend` che permette di delegare l'indicizzazione a un motore esterno. I backend supportati sono tre: `noindex` (nessuna ricerca), `tracker` (GNOME Tracker) e `elasticsearch`. Nessuno di questi era esattamente quello che cercavo.

### Il contesto: Proxmox, LXC e Alpine Linux

Il mio setup usa Proxmox come hypervisor con container LXC per i servizi. Il NAS girava inizialmente su un container Alpine Linux — leggero, veloce, perfetto per un fileserver.

Il primo ostacolo è arrivato subito: voglio la ricerca Spotlight, quindi devo scegliere un backend. Tracker è fuori discussione su Alpine — dipende da D-Bus, GNOME stack, systemd, niente di tutto ciò è disponibile in modo pratico su Alpine con musl libc. Elasticsearch è pesante e richiede una JVM. Ma esiste un'alternativa.

### Manticore Search: un Elasticsearch leggero

Manticore Search è un motore di ricerca full-text compatibile con l'API REST di Elasticsearch, scritto in C++. È molto più leggero, non richiede JVM, e ha un ottimo supporto per l'indicizzazione di testo. L'idea era usarlo come backend Elasticsearch per Samba, in un container LXC separato.

L'architettura a due container ha senso: il servizio di ricerca è separato dal fileserver, si possono aggiornare indipendentemente, e Manticore può essere raggiunto da più share se necessario.

### Il primo problema: `spotlight.so` non esiste su Alpine

Configurato Samba con `spotlight backend = elasticsearch`, ho aggiunto `vfs objects = spotlight` nella share. Risultato:

```
Error loading module '/usr/lib/samba/vfs/spotlight.so': No such file or directory
```

Il pacchetto Samba su Alpine non include il modulo VFS per Spotlight. Non è nei repository, non c'è un pacchetto separato, e compilarlo da sorgente su Alpine con musl libc è un'avventura sconsigliata.

### La migrazione a Debian 13

Ho ricreato il container NAS su Debian 13 (Bookworm). Samba 4.22 su Debian è compilato con il supporto Spotlight — lo si vede dall'output di `smbd -b` che mostra `WITH_SPOTLIGHT` e `HAVE_SPOTLIGHT_BACKEND_ES`. Il modulo è compilato staticamente in `smbd`, non come `.so` separato, quindi non va aggiunto a `vfs objects`.

### I problemi tecnici, uno per uno

#### 1. Il file di mappings mancante

Il primo errore dopo la migrazione:

```
mdssvc_es_init: Opening mapping file [/usr/share/samba/mdssvc/elasticsearch_mappings.json] failed
```

Samba cerca un file JSON che mappa gli attributi Spotlight (come `kMDItemFSName`, `kMDItemTitle`) ai campi Elasticsearch. Il file non era incluso nel pacchetto Debian. Soluzione: scaricarlo dal repository ufficiale di Samba e posizionarlo nel path corretto.

#### 2. Manticore non supporta nomi di campo con il punto

Samba manda query con campi come `path.real`, `file.filename`, `meta.title`. Manticore non accetta nomi di campo contenenti il punto — non come SQL, non con backtick, in nessun modo.

Soluzione: rinominare i campi nell'indice (`path_real`, `file_filename`, ecc.) e creare un proxy HTTP che traduce i nomi nelle richieste e nelle risposte.

#### 3. La query `prefix` non è supportata su campi full-text

Samba filtra i risultati per share usando una query `prefix` sul campo `path.real`. Manticore non supporta questo tipo di query su campi full-text. Il proxy deve intercettare e rimuovere questo filtro.

#### 4. La sintassi `query_string` di Elasticsearch non è compatibile

Samba manda query come `"query": "Fran* OR content:Fran*"` con `"fields": ["file.filename", "content"]`. Manticore non capisce la sintassi `content:Fran*` in una `query_string`. Il proxy deve riscrivere la query nel formato Manticore: `@file_filename Fran* | @content Fran*`.

#### 5. `json_loadb failed`: il Content-Length

Anche con una risposta JSON corretta, Samba continuava a dare `json_loadb failed`. Il problema era che il proxy non includeva l'header `Content-Length` nella risposta. Samba legge esattamente N byte dichiarati — senza Content-Length, il parsing fallisce.

#### 6. I caratteri accentati e `ensure_ascii`

Python di default serializza i caratteri non-ASCII come sequenze Unicode (`È` → `E\u0300`). Samba non gestisce correttamente la forma NFD (decomposed). Soluzione: `json.dumps(data, ensure_ascii=False)`.

#### 7. La struttura annidata di `path.real`

L'errore finale: `Missing path.real in JSON result`. Guardando il sorgente di Samba si scopre che il parser si aspetta:

```json
"_source": { "path": { "real": "/share/musica/..." } }
```

Non la chiave piatta `"path.real"`. Il proxy deve quindi trasformare `path_real` nell'oggetto annidato `{"path": {"real": "..."}}` nella risposta.

### Il proxy Python: la soluzione

Un piccolo proxy HTTP scritto in Python, in ascolto sulla porta 9200, che intercetta le richieste di Samba e le traduce per Manticore, e poi ritraduce le risposte nel formato che Samba si aspetta. Circa 80 righe di codice standard library, nessuna dipendenza esterna.

### Il risultato

Cercare "Battiato" dal Finder mostra i file MP3 di Franco Battiato. Cercare "Robot" trova le canzoni di Ufo Robot e i Robot di Asimov. La ricerca funziona su filename, titolo ID3, contenuto dei PDF e dei file di testo, codice sorgente PHP e JavaScript.

---

## Parte 2 — Guida pratica

### Prerequisiti

- Proxmox con due container LXC
- CT Samba: Debian 13, almeno 512MB RAM
- CT Manticore: Debian/Ubuntu, almeno 1GB RAM

### Architettura

```
macOS Finder (Spotlight)
        │  SMB + Spotlight RPC
        ▼
CT Debian — smbd + rpcd_mdssvc
        │  HTTP :9200
        ▼
CT Debian — ms-proxy.py
        │  HTTP :9308
        ▼
CT Manticore — Manticore Search
        ▲
CT Debian — spotlight-indexer.sh
        │  inotify + ffprobe/pdftotext/catdoc
        ▼
    /share (filesystem)
```

### CT Manticore — Installazione

**Distro consigliata:** Debian 12 o Ubuntu 22.04

```bash
wget https://repo.manticoresearch.com/manticore-repo.noarch.deb
dpkg -i manticore-repo.noarch.deb
apt update
apt install manticore manticore-extra
```

**`/etc/manticoresearch/manticore.conf`:**

```ini
searchd {
    listen = 9306:mysql
    listen = 9308:http
    log = /var/log/manticore/searchd.log
    query_log = /var/log/manticore/query.log
    data_dir = /var/lib/manticore
}
```

**Creazione dell'indice:**

```sql
CREATE TABLE share_samba_spotlight (
    path_real          string,
    file_filename      text,
    file_content_type  string,
    file_filesize      bigint,
    file_last_modified bigint,
    file_created       bigint,
    meta_title         text,
    meta_author        text,
    content            text,
    artist             text,
    album              text,
    year               string,
    genre              string
) min_infix_len='3' morphology='stem_en'
```

**Avvio del servizio:**

```bash
systemctl enable manticore
systemctl start manticore
```

### CT Samba/Debian — Installazione

```bash
apt install samba samba-vfs-modules \
    inotify-tools curl ffmpeg \
    poppler-utils catdoc \
    python3 jq
```

**File di mappings Spotlight:**

```bash
mkdir -p /usr/share/samba/mdssvc
curl -s https://raw.githubusercontent.com/samba-team/samba/master/source3/rpc_server/mdssvc/elasticsearch_mappings.json \
    -o /usr/share/samba/mdssvc/elasticsearch_mappings.json
```

### File di configurazione

I file da creare sul CT Samba sono:

| File                                            | Descrizione                                |
| ----------------------------------------------- | ------------------------------------------ |
| `/etc/samba/smb.conf`                           | Configurazione Samba con Spotlight backend |
| `/usr/local/bin/ms-proxy.py`                    | Proxy HTTP Samba ↔ Manticore               |
| `/usr/local/bin/spotlight-indexer.sh`           | Indicizzatore con inotify                  |
| `/usr/bin/msctl`                                | Tool CLI per la gestione dell'indice       |
| `/etc/systemd/system/ms-proxy.service`          | Unit systemd per il proxy                  |
| `/etc/systemd/system/spotlight-indexer.service` | Unit systemd per l'indicizzatore           |

### `smb.conf`

```ini
[global]
    workgroup = WORKGROUP
    server string = NAS Server
    server role = standalone server
    create mask = 664
    directory mask = 0775
    server min protocol = SMB2
    ea support = yes
    vfs objects = streams_xattr

    # Spotlight
    rpc_server:mdssvc = embedded
    spotlight backend = elasticsearch
    elasticsearch:address = 127.0.0.1   # proxy locale
    elasticsearch:port = 9200
    elasticsearch:index = share_samba_spotlight

[Musica]
    path = /share/musica
    browseable = yes
    guest ok = no
    read only = no
    valid users = @samba-group
    spotlight = yes
    vfs objects = streams_xattr
```

### ms-proxy.py

```python
#!/usr/bin/env python3
# /usr/local/bin/ms-proxy.py

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import json
import re

MANTICORE = "http://<ip-address>:9308" # your Manticore Search IP ADDRESS

def rewrite_must(musts):
    new_musts = []
    for m in musts:
        if "query_string" in m:
            qs = m["query_string"]
            query = qs.get("query", "")
            fields = qs.get("fields", ["file_filename", "content"])
            term = query.split(" OR ")[0].strip()
            field_query = " | ".join([f"@{f} {term}" for f in fields])
            new_musts.append({
                "query_string": {
                    "query": field_query
                }
            })
        else:
            new_musts.append(m)
    return new_musts

def rewrite_query(body):
    try:
        data = json.loads(body)

        body = json.dumps(data)
        body = body.replace('"path.real"', '"path_real"')
        body = body.replace('"file.filename"', '"file_filename"')
        body = body.replace('"file.content_type"', '"file_content_type"')
        body = body.replace('"file.filesize"', '"file_filesize"')
        body = body.replace('"file.last_modified"', '"file_last_modified"')
        body = body.replace('"file.created"', '"file_created"')
        body = body.replace('"meta.title"', '"meta_title"')
        body = body.replace('"meta.author"', '"meta_author"')
        data = json.loads(body)

        if "query" in data and "bool" in data["query"]:
            filters = data["query"]["bool"].get("filter", [])
            new_filters = []
            for f in filters:
                if "prefix" in f or "equals" in f:
                    pass
                else:
                    new_filters.append(f)
            data["query"]["bool"]["filter"] = new_filters
            data["query"]["bool"]["must"] = rewrite_must(
                data["query"]["bool"].get("must", [])
            )

        return json.dumps(data)
    except Exception as e:
        print(f"rewrite error: {e}", flush=True)
        return body

def rewrite_response(body):
    try:
        data = json.loads(body)
        data.pop("status", None)

        hits = data.get("hits", {}).get("hits", [])
        for hit in hits:
            source = hit.get("_source", {})
            if "path_real" in source:
                source["path"] = {"real": source.pop("path_real")}

        body = json.dumps(data, ensure_ascii=False)
        body = body.replace('"file_filename"', '"file.filename"')
        body = body.replace('"file_content_type"', '"file.content_type"')
        body = body.replace('"file_filesize"', '"file.filesize"')
        body = body.replace('"file_last_modified"', '"file.last_modified"')
        body = body.replace('"file_created"', '"file.created"')
        body = body.replace('"meta_title"', '"meta.title"')
        body = body.replace('"meta_author"', '"meta.author"')

        return body
    except Exception as e:
        print(f"rewrite_response error: {e}", flush=True)
        return body

class ProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # silence HTTP logs

    def do_GET(self):
        self.proxy(None)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length else ""
        self.proxy(body)

    def do_DELETE(self):
        self.proxy(None)

    def proxy(self, body):
        if body:
            body = rewrite_query(body)

        url = MANTICORE + self.path
        req = urllib.request.Request(
            url,
            data=body.encode("utf-8") if body else None,
            method=self.command
        )
        req.add_header("Content-Type", "application/json")

        try:
            with urllib.request.urlopen(req) as resp:
                response_body = resp.read().decode("utf-8")
                response_body = rewrite_response(response_body)
                encoded = response_body.encode("utf-8")
                self.send_response(resp.status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(encoded)))
                self.end_headers()
                self.wfile.write(encoded)
        except urllib.error.HTTPError as e:
            response_body = e.read().decode("utf-8")
            response_body = rewrite_response(response_body)
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(response_body.encode("utf-8"))

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 9200), ProxyHandler)
    print("Proxy listening on :9200")
    server.serve_forever()
```
### spotlight-indexer.sh

```sh
#!/bin/sh
# /usr/local/bin/spotlight-indexer.sh

SHARE="/share" # your share folder
MS_URL="http://<ip-address>:9308" # your Manticore Search URL
INDEX="share_samba_spotlight" # your Manticore Search index name

# ── Helpers ──────────────────────────────────────────────

PIDFILE="/run/spotlight-indexer.pid"

cleanup() {
    echo "==> Stopping..."
    kill -- -$$
    exit 0
}

trap cleanup TERM INT

should_skip() {
    case "$1" in
        */node_modules/*|*/.git/*|*/vendor/*|*/.env) return 0 ;;
        *) return 1 ;;
    esac
}

init_index() {
    RESULT=$(curl -s -X POST "$MS_URL/cli" \
        -H "Content-Type: application/json" \
        -d "SHOW TABLES LIKE '$INDEX'")

    if echo "$RESULT" | grep -q "$INDEX"; then
        echo "==> Index '$INDEX' found."
    else
        echo "==> Index not found, creating..."
        curl -s -X POST "$MS_URL/cli" \
            -H "Content-Type: application/json" \
            -d "CREATE TABLE $INDEX (
                path_real          string,
                file_filename      text,
                file_content_type  string,
                file_filesize      bigint,
                file_last_modified bigint,
                file_created       bigint,
                meta_title         text,
                meta_author        text,
                content            text,
                artist             text,
                album              text,
                year               string,
                genre              string
            ) min_infix_len='3' morphology='stem_en'"
        echo "==> Index created."
    fi
}

find_doc_id() {
    FILE_ESC=$(echo "$1" | sed 's/"/\\"/g')
    curl -s -X POST "$MS_URL/cli" \
        -H "Content-Type: application/json" \
        -d "SELECT id FROM $INDEX WHERE MATCH('@path_real \"$FILE_ESC\"') LIMIT 1" \
        | grep -o '[0-9]\{10,\}' | head -1
}

delete_from_index() {
    FILE="$1"
    DOC_ID=$(find_doc_id "$FILE")
    if [ -n "$DOC_ID" ]; then
        curl -s -X POST "$MS_URL/cli" \
            -H "Content-Type: application/json" \
            -d "DELETE FROM $INDEX WHERE id=$DOC_ID" > /dev/null
        echo "==> Removed: $FILE (id: $DOC_ID)"
    fi
}

get_mime_type() {
    EXT="$1"
    case "$EXT" in
        mp3|MP3)          echo "audio/mpeg" ;;
        pdf|PDF)          echo "application/pdf" ;;
        doc|DOC)          echo "application/msword" ;;
        docx|DOCX)        echo "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ;;
        md|mdx)           echo "text/plain" ;;
        txt)              echo "text/plain" ;;
        html|htm)         echo "text/html" ;;
        php)              echo "text/x-php" ;;
        js)               echo "application/javascript" ;;
        ts)               echo "application/typescript" ;;
        json)             echo "application/json" ;;
        css)              echo "text/css" ;;
        rst)              echo "text/x-rst" ;;
        yaml|yml)         echo "text/yaml" ;;
        toml)             echo "text/toml" ;;
        *)                echo "application/octet-stream" ;;
    esac
}

extract_and_index() {
    FILE="$1"
    [ -f "$FILE" ] || return

    FILENAME=$(basename "$FILE")
    EXT="${FILENAME##*.}"
    MTIME=$(stat -c %Y "$FILE")
    SIZE=$(stat -c %s "$FILE")
    MIME=$(get_mime_type "$EXT")
    CONTENT=""
    TITLE=""
    ARTIST=""
    ALBUM=""
    YEAR=""
    GENRE=""
    AUTHOR=""

    case "$EXT" in
        mp3|MP3)
            TITLE=$(ffprobe -v quiet -show_entries \
                format_tags=title \
                -of default=nw=1:nk=1 "$FILE" 2>/dev/null)
            ARTIST=$(ffprobe -v quiet -show_entries \
                format_tags=artist \
                -of default=nw=1:nk=1 "$FILE" 2>/dev/null)
            ALBUM=$(ffprobe -v quiet -show_entries \
                format_tags=album \
                -of default=nw=1:nk=1 "$FILE" 2>/dev/null)
            YEAR=$(ffprobe -v quiet -show_entries \
                format_tags=date \
                -of default=nw=1:nk=1 "$FILE" 2>/dev/null)
            GENRE=$(ffprobe -v quiet -show_entries \
                format_tags=genre \
                -of default=nw=1:nk=1 "$FILE" 2>/dev/null)
            ;;
        pdf|PDF)
            CONTENT=$(pdftotext "$FILE" - 2>/dev/null | \
                head -c 50000 | tr '"\\' "' ")
            ;;
        doc|docx)
            CONTENT=$(catdoc "$FILE" 2>/dev/null | \
                head -c 50000 | tr '"\\' "' ")
            ;;
        md|mdx)
            TITLE=$(grep -m1 '^# ' "$FILE" | sed 's/^# //')
            CONTENT=$(head -c 50000 "$FILE" | tr '"\\' "' ")
            ;;
        php|js|ts|css|html|json|rst|txt|yaml|yml|toml)
            CONTENT=$(head -c 50000 "$FILE" | tr '"\\' "' ")
            ;;
        *)
            return
            ;;
    esac

    FILENAME_ESC=$(echo "$FILENAME" | sed 's/"/\\"/g')
    FILE_ESC=$(echo "$FILE"         | sed 's/"/\\"/g')
    TITLE_ESC=$(echo "$TITLE"       | sed 's/"/\\"/g')
    CONTENT_ESC=$(echo "$CONTENT"   | sed 's/"/\\"/g')
    ARTIST_ESC=$(echo "$ARTIST"     | sed 's/"/\\"/g')
    ALBUM_ESC=$(echo "$ALBUM"       | sed 's/"/\\"/g')

    delete_from_index "$FILE"

    curl -s -X POST "$MS_URL/$INDEX/_doc" \
        -H "Content-Type: application/json" \
        -d "{
            \"path_real\":          \"$FILE_ESC\",
            \"file_filename\":      \"$FILENAME_ESC\",
            \"file_content_type\":  \"$MIME\",
            \"file_filesize\":      $SIZE,
            \"file_last_modified\": $MTIME,
            \"file_created\":       $MTIME,
            \"meta_title\":         \"$TITLE_ESC\",
            \"meta_author\":        \"$ARTIST_ESC\",
            \"content\":            \"$CONTENT_ESC\",
            \"artist\":             \"$ARTIST_ESC\",
            \"album\":              \"$ALBUM_ESC\",
            \"year\":               \"$YEAR\",
            \"genre\":              \"$GENRE\"
        }" > /dev/null

    echo "==> Indexed: $FILE"
}

# ── Main ─────────────────────────────────────────────────

init_index

echo "==> Starting initial crawl of $SHARE"
find "$SHARE" -type f | while read f; do
    should_skip "$f" || extract_and_index "$f"
done
echo "==> Crawl completed, starting watch..."

inotifywait -m -r \
    -e create,moved_to,close_write,delete,moved_from \
    --format '%e %w%f' \
    "$SHARE" | while read event filepath; do
        should_skip "$filepath" && continue
        case "$event" in
            CREATE|MOVED_TO|CLOSE_WRITE)
                extract_and_index "$filepath"
                ;;
            DELETE|MOVED_FROM)
                delete_from_index "$filepath"
                ;;
        esac
done
```

### ms-proxy.service

```ini
[Unit]
Description=Manticore Search Proxy for Samba Spotlight
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 /usr/local/bin/ms-proxy.py
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ms-proxy

[Install]
WantedBy=multi-user.target
```

### spotlight-indexer.service

```ini
[Unit]
Description=Spotlight Indexer for Samba
After=network.target samba.service
Requires=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/spotlight-indexer.sh
ExecStop=/bin/kill -TERM $MAINPID
KillMode=process
KillSignal=SIGTERM
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

StandardOutput=journal
StandardError=journal
SyslogIdentifier=spotlight-indexer

[Install]
WantedBy=multi-user.target
```

### Avvio dei servizi

```bash
systemctl daemon-reload
systemctl enable ms-proxy spotlight-indexer
systemctl start ms-proxy spotlight-indexer
systemctl restart smbd
```

### Verifica finale

```bash
# Controlla che i servizi girino
systemctl status ms-proxy spotlight-indexer smbd

# Conta i documenti nell'indice
msctl count

# Cerca un file
msctl search README.md

# Log in tempo reale durante una ricerca dal Mac
journalctl -u smbd -f
journalctl -u ms-proxy -f
```

### Troubleshooting

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `spotlight.so: No such file` | Pacchetto incompleto | Usare Debian, non Alpine |
| `elasticsearch_mappings.json failed` | File mancante | Scaricarlo dal repo Samba |
| `json_loadb failed` | Content-Length mancante o JSON malformato | Verificare il proxy |
| `Missing path.real` | Struttura JSON sbagliata | Il proxy deve annidare `path.real` |
| `index_not_found_exception` | Indice non creato | Eseguire `msctl create` |
| Ricerca vuota nonostante risultati in Manticore | Query_string incompatibile | Verificare la riscrittura nel proxy |

**Log da monitorare:**

```bash
tail -f /var/log/samba/log.rpcd_mdssvc   # errori Spotlight
journalctl -u ms-proxy -f                # query/response del proxy
tail -f /var/log/manticore/query.log     # query ricevute da Manticore
journalctl -u spotlight-indexer -f       # indicizzazione
```
