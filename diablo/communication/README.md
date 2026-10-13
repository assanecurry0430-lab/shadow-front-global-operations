# Protocole de communication de Diablo

## Objectif

Organiser les futures communications entre Diablo et les agents de développement de SFO.

## Stockage

Le fichier messages.jsonl contient un message JSON par ligne.
Une ligne correspond à un message indépendant.

## Champs obligatoires d'un message

- id : identifiant unique du message
- timestamp : date et heure au format ISO 8601
- from : agent émetteur
- to : agent destinataire
- type : catégorie du message
- status : état du message
- taskId : identifiant de la tâche associée, ou null
- content : contenu du message

## Types de messages prévus

- task_request : demande de travail
- task_result : résultat proposé
- review_request : demande de vérification
- review_result : résultat de vérification
- error : signalement d'une erreur
- status_update : mise à jour de l'état

## États prévus

- queued : en attente de traitement
- processing : en cours de traitement
- completed : traitement terminé
- failed : échec
- awaiting_approval : approbation humaine nécessaire

## Règles de sécurité

1. Un agent non connecté et non vérifié ne peut pas être considéré comme opérationnel.
2. Les messages ne déclenchent pas automatiquement l'exécution de code.
3. Les changements importants nécessitent une approbation humaine.
4. Les résultats doivent être vérifiés avant leur intégration au projet.
5. Les données existantes doivent être sauvegardées avant toute modification risquée.
6. La communication avec les services externes nécessite une intégration et des tests spécifiques.

## État actuel

Le protocole est documenté, mais la communication réelle avec les agents externes n'est pas encore configurée.
