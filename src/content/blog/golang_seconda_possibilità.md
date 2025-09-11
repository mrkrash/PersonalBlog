---
title: 'Go: Una Seconda Possibilità'
description: 'Dopo anni di scetticismo verso Go, ho deciso di dargli una seconda possibilità sviluppando Order-Bits, un sistema per gestire componenti elettronici. Dalla sintassi che non mi convinceva ai vantaggi che non avevo saputo cogliere: la mia esperienza nel riscoprire il linguaggio di Google.'
pubDatetime: 2025-09-11
ogImage: '/assets/libri.webp'
tags: ['golang', 'go-language', 'programming', 'development', 'web-development', 'electronics', 'inventory-management', 'components-tracking', 'json', 'database', 'crud', 'rest-api', 'github', 'open-source', 'developer-experience', 'programming-languages', 'learning', 'second-chances', 'order-bits', 'maker', 'electronics-components']
---

# Go: Una Seconda Possibilità

Qualche anno fa, sull'onda della novità, provai Go. Le solite cose: esercizi base, lettura della documentazione, primi esperimenti. Ma due elementi mi frenarono dall'adottarlo definitivamente: la sintassi e il fatto che fosse l'ennesimo prodotto targato Google.

La sintassi mi disturbava particolarmente - l'assenza del punto e virgola e soprattutto il dichiarare il tipo delle variabili *dopo* il nome mi sembrava... be', orrendo. E sinceramente, lo penso ancora oggi.

## Il Ritorno

A distanza di anni, complici le ferie estive e un po' di tempo libero, ho deciso di dare a Go una seconda possibilità. Il ragionamento era semplice: se è utilizzato in progetti mission-critical come Kubernetes e parti di TensorFlow, qualcosa di buono deve pur averlo.

Così ho sviluppato un semplice programma per aiutarmi a riorganizzare i cassetti della mia scrivania (sì, anche i programmatori hanno bisogni molto concreti!). Il progetto, che ho chiamato [Order-Bits](https://github.com/senzidee/order-bits), è nato dall'esigenza di catalogare e gestire i componenti elettronici sparsi per casa - resistenze, condensatori, microcontrollori e tutto quello che un maker accumula nel tempo.

## Le Sorprese

Quello che mi ha davvero colpito è stata la semplicità con cui Go gestisce operazioni che in altri linguaggi richiedono spesso librerie aggiuntive o codice boilerplate:

* **JSON marshalling/unmarshalling**: convertire un payload JSON in un oggetto utilizzabile richiede letteralmente una riga di codice
* **Database operations**: senza framework esterni, sono riuscito a implementare CRUD completo con pochissime righe
* **Conciseness**: il rapporto tra codice scritto e funzionalità ottenute è stato sorprendentemente favorevole

Sviluppare Order-Bits mi ha permesso di apprezzare quanto Go sia efficace per creare API REST pulite e performanti. Il sistema di gestione dell'inventario che ho implementato include funzionalità come ricerca avanzata, categorizzazione automatica e tracking delle quantità - tutto con un codebase sorprendentemente compatto.

## Il Progetto Concreto

[Order-Bits](https://github.com/senzidee/order-bits) è più di un semplice esperimento: è diventato uno strumento che uso quotidianamente. Le funzionalità principali includono:

- **Catalogazione componenti**: ogni elemento ha categoria, specifiche tecniche e posizione fisica
- **API REST completa**: endpoints per tutte le operazioni CRUD
- **Ricerca intelligente**: filtri per categoria, valore, tolleranza
- **Gestione quantità**: tracking di stock e soglie di riordino

Il fatto che tutto questo sia stato implementato in Go senza dipendenze esterne pesanti dimostra la maturità del linguaggio per questo tipo di applicazioni.

## Verdetto (Provvisorio)

La sintassi continua a non convincermi del tutto, ma devo ammettere che Go ha qualità che vanno oltre le preferenze estetiche. La sua filosofia "less is more" inizia ad avere senso quando vedi quanto poco codice serve per ottenere risultati concreti.

Forse il primo approccio era stato troppo influenzato dai pregiudizi. Forse serve davvero una seconda possibilità per apprezzare certi strumenti. E forse, a volte, la bellezza di un linguaggio si rivela nell'uso pratico più che nella sintassi.
