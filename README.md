# Digital ansattdeling: En løsning på bemanningsutfordringer i dagligvarebransjen
**Nettside:** [https://fastoff.no](https://fastoff.no)

## Introduksjon

Dette prosjektet er utviklet som en del av en bacheloroppgave i samarbeid med **Coop Øst SA**. Formålet er å løse en kjent utfordring i dagligvarebransjen: bemanningsbehov ved sykdom, høytider eller andre uforutsette hendelser. Butikksjefer bruker i dag mye tid på manuell koordinering for å fylle ledige vakter – ofte uten oversikt over tilgjengelige ansatte i nærliggende butikker.

Vi har utviklet en digital plattform som gjør det mulig for butikksjefer å publisere ledige vakter, og for ansatte fra egen eller andre butikker å reservere dem. Butikksjefer får oversikt over egne og eksterne ansatte som er tilgjengelige for arbeid, og både ansatte og sjefer kan se hvilke Coop Øst-butikker som har ledige vakter.

Plattformen bidrar til bedre utnyttelse av personalressurser og gir ansatte økt fleksibilitet og valgfrihet. Løsningen er utviklet for Coop Øst – Norges største samvirkelag, med over 120 butikker og ca. 2600 ansatte.

---

## Teknologistack (PERN)

- **Database** – PostgreSQL (administrert via Supabase)  
- **Backend** – Node.js med Express  
- **Frontend** – React

---

## Kom i gang

### 1. Klon prosjektet

```bash
git clone https://github.com/edgardahl/bacherlor2025.git
cd bacherlor2025
```

### 2. Installer dependencies

Frontend:
```bash
cd frontend
npm install
```
Backend:
```bash
cd backend
npm install
```

### 3. Konfigurer environment variabler

For at prosjektet skal fungere lokalt må du sette opp .env-filer for både frontend og backend.
Begge mapper inneholder en .env.example-fil som du kan bruke som mal.

### 4. Start utviklingsservere

Frontend:
```bash
cd frontend
npm run dev
```
Backend:
```bash
cd backend
nodemon server.js
```
