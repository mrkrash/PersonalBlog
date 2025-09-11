---
title: 'MySQL & CronJob'
description: 'MySQL & CronJob'
pubDatetime: 2017-03-06
ogImage: '/assets/libri.webp'
tags: ['CPU Resource', 'CronJob', 'CronTab', 'Event', 'Event Scheduler', 'Linux', 'MySQL', 'Pianificazione', 'Schedulazione', 'Scheduling', 'Shell Script']
---

Spesso capita di dover eseguire delle azioni ripetitive e, generalmente, ci si affida a [Cron](https://it.wikipedia.org/wiki/Crontab).  
**Cron** è affidabile senz’altro ma, se l’operazione ripetitiva riguarda la manutenzione di alcune tabelle piuttosto che l’eliminazione di alcuni record (temporanei, di sessione), significa dover creare un script (in php, in python, in bash) che stabilisca una connessione al database ed esegua la query.  
 Ma fare questo significa impegnare il processore in tre processi:

1. **Crontab**, che deve tener conto dell’azione da eseguire e di quando eseguirla
2. L’**interprete** dello script, che dovrà leggere ed eseguire le vostre istruzioni
3. **MySQL**, che eseguirà il vero e proprio lavoro

Ma non si potrebbe ridurre tutto a un singolo processo? Sì, basta delegare **MySQL** a fare tutto da se, ovvero con il suo [scheduler](https://dev.mysql.com/doc/refman/5.7/en/event-scheduler.html).Per usarlo, prima di tutto dobbiamo assicurarci che sia abilitato:
```sql
SET GLOBAL event_scheduler = ON;
```
e quindi creare l’evento con le informazioni necessarie e i comandi da eseguire:
```sql
CREATE EVENT delmessage ON SCHEDULE EVERY 1 DAY
STARTS '2017-03-01 00:00:00'
DO
DELETE FROM tbl_message WHERE DATEDIFF( NOW( ) , timestamp ) >=7;
```
L’evento “delmessage” appena creato altro non farà, la mezzanotte di ogni giorno a partire dallo 01-03-2017, che eliminare dalla tabella “tbl_message” tutti i record più vecchi di 7 giorni.  
 Fatto. Un solo processo.