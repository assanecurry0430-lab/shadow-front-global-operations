# SHADOW FRONT: GLOBAL OPERATIONS (SFO)
## Prototype de départ — projet Roblox

Ce ZIP contient une base de projet organisée, des spécifications, des données fictives de monde et des modules Luau de départ pour Roblox Studio.

**Important :** ce n'est pas encore un jeu complet ni un fichier `.rbxl` jouable prêt à publier. Il s'agit d'un prototype de code et de données à intégrer dans Roblox Studio, puis à tester et développer progressivement. Les cartes 3D, modèles, animations, sons, missions complètes, interfaces finales et équilibrage restent à construire.

## Fonctionnalités préparées dans cette base
- Données générées pour 50 pays fictifs sur 3 continents (Vardessia 17, Kaelthara 17, Orméthys 16).
- 14 à 17 régions par pays (700 à 850 régions au total).
- Types de régions et villes en quantité variable.
- Squelette de diplomatie dynamique à rythme équilibré.
- Système de calendrier/service/repos/congés en base.
- Système de récompenses de mission calculées côté serveur.
- Squelette immobilier.
- Smartphone/notifications contextuelles : priorité, grade, unité, congé et gravité.
- Principes de sécurité serveur et feuille de route.

## Installation dans Roblox Studio
1. Décompresser le ZIP sur un ordinateur.
2. Ouvrir Roblox Studio et créer une expérience Baseplate.
3. Dans Explorer, créer les dossiers/modules indiqués dans `docs/ROBLOX_INSTALLATION.md`.
4. Copier chaque fichier `.lua`/`.luau` dans le type d'objet Roblox indiqué.
5. Importer `data/world.json` comme référence de données (ou convertir les données en ModuleScript avec l'outil décrit dans la documentation).
6. Tester d'abord en mode Play avec un seul joueur, puis avec un serveur local multi-joueur.
7. Ne publier aucune fonctionnalité d'économie ou de communication avant d'avoir testé les permissions et les validations serveur.

## Structure
- `src/ReplicatedStorage/SFO/Shared`: constantes et types partagés.
- `src/ServerScriptService/SFO/Services`: logique serveur de base.
- `src/StarterPlayer/StarterPlayerScripts/SFO`: point de départ client pour le téléphone.
- `data/world.json`: données du monde fictif.
- `docs/`: cahier des charges, architecture, installation et roadmap.

## Principes retenus
- Univers fictif et contenu original.
- Toutes les valeurs monétaires en dollars de jeu ($).
- Diplomatie équilibrée : incidents possibles régulièrement, changements majeurs graduels.
- Les changements diplomatiques ne transfèrent jamais automatiquement la propriété d'une base.
- Les primes sont attribuées et validées par le serveur.
- Les congés ne sont pas interrompus pour chaque incident mineur.
- Les messages et communications doivent respecter les règles de sécurité et de communication de Roblox.
