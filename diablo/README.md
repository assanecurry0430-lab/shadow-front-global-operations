# Diablo — Orchestrateur de développement SFO

Diablo coordonne progressivement la construction de
SHADOW FRONT: GLOBAL OPERATIONS (SFO).

## Objectif général

Préparer un projet complet, organisé et vérifié, livré dans une archive
unique nommée SFO_FINAL.zip, destinée à une intégration ultérieure dans
Roblox Studio.

## Moteur cible

- Roblox Studio est l'unique moteur cible du projet.
- Unreal Engine 5 n'est pas une cible de développement.
- La construction du code, des données et des systèmes précède
  l'intégration finale dans Roblox Studio.
- Les composants spécifiques à Roblox doivent être préparés pour
  être importables ou intégrables dans Roblox Studio.

## Architecture de Diablo

Diablo est le coordinateur central du développement.

Les fonctions prévues comprennent :
- gestion et distribution des tâches ;
- communication entre les IA constructrices ;
- mémoire partagée des décisions et des résultats ;
- suivi de l'avancement ;
- journalisation des opérations ;
- vérification des résultats ;
- approbation humaine des modifications importantes.

La communication réelle entre les IA doit être configurée et testée
avant de considérer les intégrations comme opérationnelles.

## Organisation du projet

- Le dépôt SFO reste la source officielle du code.
- Les données et règles communes sont organisées indépendamment
  des outils utilisés pour les construire.
- Le code destiné à Roblox est préparé séparément des outils
  de coordination de Diablo.
- Les résultats des IA doivent être contrôlés avant intégration.

## Sécurité et validation

- Les modifications importantes nécessitent une validation humaine.
- Les sauvegardes sont réalisées avant les changements sensibles.
- Les tests doivent précéder l'intégration des modifications.
- Les secrets et clés API ne doivent pas être inclus dans
  l'archive finale distribuable.
- Aucun déploiement ou changement sensible ne doit être effectué
  automatiquement sans autorisation et contrôles préalables.

## Livraison finale

Le livrable visé est SFO_FINAL.zip, contenant :
- les données et systèmes effectivement développés ;
- le code destiné à Roblox ;
- les outils de coordination nécessaires ;
- les tests et rapports disponibles ;
- la documentation et les instructions d'intégration.

L'archive finale ne doit être déclarée prête qu'après vérification
de son contenu et des tests applicables.

## État actuel

Le projet est en cours de construction.
Les fonctions existantes doivent être vérifiées avant toute extension.
La communication entre les IA et l'intégration finale dans Roblox
Studio restent des étapes de développement.
