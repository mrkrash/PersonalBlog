---
title: 'Nullish|OR Javascript Operator'
short: 'Nullish|OR Operator'
date: '2021-11-03'
image: '/images/libri.webp'
tags: ['Javascript', 'LogicalOperator', 'Tip', 'Developing', 'Typescript', 'ES6']
---

Grazie agli operatori logici, possiamo assegnare condizionalmente dei valori alle nostre variabili in maniera più semplice.
Cosa significa?
Che nel caso in cui dobbiamo assegnare a una variabile un valore solo nel caso in cui sia **null**, **undefined** o **falsy¹**, anziche creare tutta la struttura di controllo, possiamo utilizzare gli operatori logici **??=** e **||=**

## Logical nullish assignment ??=

```js
let my_nullish_var;

// Only assigns a value if my_nullish_var is null or undefined
my_nullish_var ??= 'Assigned Value';

console.log(my_nullish_var); // OUTPUT: 'Assigned Value'
```

Above code snippet is equivalent to

```js
let my_nullish_var;

if ((my_nullish_var === null) || (my_nullish_var === undefined)) {
  my_nullish_var = 'Assigned Value';
}
```

## Logical OR assignment ||=

```js
let my_falsy_var;

// Only assign a value if my_falsy_var is falsy
my_falsy_var ||= 'Assigned Value'

console.log(my_falsy_var) // OUTPUT: 'Assigned Value'
```

Above code snippet is equivalent to

```js
let my_falsy_var;

if (!my_falsy_var) {
  my_falsy_var = 'Assigned Value';
}
```
---
¹ **falsy**: *Un valore falsy (a volte scritto falsey) è un valore che è considerato falso quando si incontra in un test booleano. Ref. [MDN Glossary Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)*