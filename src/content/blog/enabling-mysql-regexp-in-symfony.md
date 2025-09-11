---
title: 'Use Regexp in Doctrine with MySQL'
description: 'MySQL support Regexp in query but Doctrine do not recognize it. We write an extension to enable it'
pubDatetime: 2024-11-19
abstract: 'REGEXP is a vendor specific function so Doctrine itself doesn\'t support it. Plus it\'s not a function so much as a comparison operator'
ogImage: '/assets/refacotring.webp'
tags: ['PHP', 'DQL', 'Doctrine', 'Symfony', 'Developing', 'DoctrineExtension']
---

[MySQL REGEXP](https://dev.mysql.com/doc/refman/8.4/en/regexp.html) is a simple way to query a database by using regex expression.
Unfortunately, REGEXP is a vendor specific function so Doctrine itself doesn't support it. Plus it's not a function so much as a comparison operator.
The solution could be install [DoctrineExtensions](https://github.com/beberlei/DoctrineExtensions) that integrate various specific vendor function. Or you can introduce this behaviour with a custom DQL function.

## Custom DQL Function
It's really simple adding a custom dql functions to extend the doctrine fixtures.
First of all we need to write our RegexpFunction by extends the Doctrine ORM FunctionNode.
The FunctionNode class requires you to implement two methods, one for the parsing process called **parse** and one for the TreeWalker process called **geetSql**

```php
namespace App\Doctrine\Query\Mysql;

use Doctrine\ORM\Query\AST\ASTException;
use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\AST\Node;
use Doctrine\ORM\Query\AST\Subselect;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\QueryException;
use Doctrine\ORM\Query\SqlWalker;
use Doctrine\ORM\Query\TokenType;

class Regexp extends FunctionNode
{
    public ?Node $value = null;

    public null|Node|string|Subselect $regexp = null;

    /**
     * @throws QueryException
     */
    public function parse(Parser $parser): void
    {
        $parser->match(TokenType::T_IDENTIFIER);
        $parser->match(TokenType::T_OPEN_PARENTHESIS);
        $this->value = $parser->StringPrimary();
        $parser->match(TokenType::T_COMMA);
        $this->regexp = $parser->StringExpression();
        $parser->match(TokenType::T_CLOSE_PARENTHESIS);
    }

    /**
     * @throws ASTException
     */
    public function getSql(SqlWalker $sqlWalker): string
    {
        return '(' . $this->value->dispatch($sqlWalker) . ' REGEXP ' . $this->regexp->dispatch($sqlWalker) . ')';
    }
}

```

The **parse** function works in order to identify this syntax:

```
regexp(field, <REGEX EXPRESSION>)
```

The **getSql** function instead works in a really simple way, by returning the expected SQL statements.

Now we must register our custom DQL functions on doctrine, by adding this line in *doctrine.yaml* inside *config/package* dir:

```yaml
doctrine:
    orm:
        dql:
            string_functions:
                REGEXP: App\Doctrine\Query\Mysql\Regexp
```

## Usage

Now we can use REGEXP function in our DQL query:

```php
$query->andWhere("regexp(a.field, '^[a-d]') != false");
```
