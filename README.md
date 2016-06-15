= jqExpression: A jQuery arithmetic expression evaluator

== What is it?

jqExpression is a jQuery plugin that creates a button alongside a text field 
which when clicked evaluates the text field's contents as an arithmetic 
expression and inserts it into the field. That is, if you enter an expression 
such as `3 \* 4 + 7` into the field and click the button, the contents of the 
field with be replaced with `19.00` (it was written for an accounting package).

The plugin understands the basic arithmetic operations (with customary regular 
precedence), and parenthesized expressions. It uses its own parser so as 
not to call `eval` and arbitrary-precision number implementation to avoid 
rounding error.


== How to use it

See the file `plugin-tester` in the repository.
