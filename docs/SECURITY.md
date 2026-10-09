# Sécurité minimale

- L'argent, les primes, les achats et la propriété sont autoritaires côté serveur.
- Le client ne doit jamais choisir librement le montant d'une récompense.
- Valider type, taille, fréquence et permissions de chaque requête client.
- Limiter les appels répétés avec des rate limits.
- Vérifier les soldes et la propriété côté serveur avant chaque transaction.
- Utiliser DataStoreService avec gestion des erreurs et tentatives limitées.
- Ne pas stocker de données sensibles inutiles.
- Les messages entre joueurs doivent utiliser les outils de communication compatibles avec les règles Roblox, notamment les protections de texte requises.
- Journaliser les changements économiques et opérations importantes sans collecter de données personnelles inutiles.
