# Installation manuelle dans Roblox Studio

Cette archive n'est pas un projet `.rbxl` prêt à lancer. Elle fournit des sources à copier dans une expérience Roblox Studio.

## 1. Créer les dossiers
Dans Explorer, crée :
- `ReplicatedStorage`
  - `SFO` (Folder)
    - `Shared` (Folder)
      - `SFOConfig` (ModuleScript)
- `ServerScriptService`
  - `SFO` (Folder)
    - `Services` (Folder)
      - `MissionRewardService` (ModuleScript)
      - `PhoneNotificationService` (ModuleScript)
      - `DiplomacyService` (ModuleScript)
      - `HousingService` (ModuleScript)
      - `CalendarService` (ModuleScript)
    - `Bootstrap.server.lua` (Script)
- `StarterPlayer > StarterPlayerScripts`
  - `SFOPhone.client.lua` (LocalScript)

## 2. Copier le code
Copie le contenu de chaque fichier `.lua` dans le ModuleScript/Script/LocalScript correspondant.
`SFOConfig.lua` doit être un ModuleScript nommé `SFOConfig`.
Les fichiers sous `Services` sont tous des ModuleScripts.

## 3. Vérification initiale
- Lance Play Solo.
- Ouvre View > Output.
- Le serveur doit afficher `SFO services initialized`.
- Le client doit afficher `SFO phone client initialized`.

## 4. À faire avant une vraie publication
- Remplacer les données de démonstration par des données validées.
- Implémenter la sauvegarde persistante avec DataStoreService et gérer les échecs.
- Ajouter les RemoteEvents/RemoteFunctions avec validation stricte côté serveur.
- Ajouter une vraie interface téléphone.
- Créer les cartes, modèles, animations, sons et missions.
- Tester les exploits, achats simultanés, paiements répétés et multi-serveur.
