# 📅 Calendari de Final de Curs 2025-26 - INS Ramon Turró

Aquest projecte visualitza el calendari de final de curs extret d'un full de càlcul Excel. La web es publica automàticament a GitHub Pages.

## 🚀 Com actualitzar el calendari amb noves dades

Quan el fitxer `Dades.xlsx` canvïi, segueix aquests passos per actualitzar la web:

### 1. Preparació de les dades

Assegura't que el fitxer **`Dades.xlsx`** estigui a la carpeta principal amb les pestanyes correctament anomenades (`ESO`, `1 BTX`, `2 BTX`, `CF`, `PFI`).

### 2. Execució de l'extracció (Python)

Executa el script de Python per transformar l'Excel en el format JSON que llegeix la web:

```bash
# Executa el script d'extracció (genera calendar_data.json)
python3 extract_calendar_data.py

# Copia les dades a la carpeta del projecte web
cp calendar_data.json visual-calendar/src/calendar_data.json
```

### 3. Publicació a la web (Git)

Perquè els canvis siguin visibles a la web, puja el fitxer de dades actualitzat al repositori:

```bash
# Entra a la carpeta del projecte
cd visual-calendar

# Afegeix el fitxer de dades
git add src/calendar_data.json

# Crea el commit i puja els canvis
git commit -m "Actualització de dades del calendari"
git push origin main
```

La web s'actualitzarà automàticament en 1-2 minuts a:
👉 [https://insramonturro.github.io/CalendariJuny26/](https://insramonturro.github.io/CalendariJuny26/)

## 🛠️ Estructura del projecte

- `Dades.xlsx`: Font de dades original.
- `extract_calendar_data.py`: Script que llegeix l'Excel i genera el JSON (configurat per no perdre cap fila, incloent comentaris).
- `visual-calendar/`: Projecte React (Vite) que mostra el calendari visualment.
- `.github/workflows/`: Configuració per a la publicació automàtica a GitHub Pages.
