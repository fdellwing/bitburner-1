# Find All Valid Math Expressions

You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are given the following string which contains only digits between 0 and 9:

43446

You are also given a target number of -42. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)

The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:

["43446", -42]

NOTE: The order of evaluation expects script operator precedence NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression Examples:

`Input: digits = "123", target = 6`

`Output: [1+2+3, 1*2*3]`

`Input: digits = "105", target = 5`

`Output: [1*0+5, 10-5]`

```
    // Javascript program to find all possible expression which
    // evaluate to target
     
    // Utility recursive method to generate all possible
    // expressions
    function getExprUtil(res, curExp, input, target, pos, curVal, last)
    {
        // true if whole input is processed with some
        // operators
        if (pos == input.length)
        {
            // if current value is equal to target
            //then only add to final solution
            // if question is : all possible o/p then just
            //push_back without condition
            if (curVal == target)
                res.push(curExp);
            return;
        }
 
        // loop to put operator at all positions
        for (let i = pos; i < input.length; i++)
        {
            // ignoring case which start with 0 as they
            // are useless for evaluation
            if (i != pos && input[pos] == '0')
                break;
 
            // take part of input from pos to i
            let part = input.substr(pos, i + 1 - pos);
 
            // take numeric value of part
            let cur = parseInt(part, 10);
 
            // if pos is 0 then just send numeric value
            // for next recursion
            if (pos == 0)
                getExprUtil(res, curExp + part, input,
                         target, i + 1, cur, cur);
 
 
            // try all given binary operator for evaluation
            else
            {
                getExprUtil(res, curExp + "+" + part, input,
                         target, i + 1, curVal + cur, cur);
                getExprUtil(res, curExp + "-" + part, input,
                         target, i + 1, curVal - cur, -cur);
                getExprUtil(res, curExp + "*" + part, input,
                         target, i + 1, curVal - last + last * cur,
                         last * cur);
            }
        }
    }
 
    // Below method returns all possible expression
    // evaluating to target
    function getExprs(input, target)
    {
        let res = [];
        getExprUtil(res, "", input, target, 0, 0, 0);
        return res;
    }
 
    // method to print result
    function printResult(res)
    {
        for (let i = 0; i < res.length; i++)
            document.write(res[i] + " ");
        document.write("</br>");
    }
     
    let input = "123";
    let target = 6;
    let res = getExprs(input, target);
    printResult(res);
  
    input = "125";
    target = 7;
    res = getExprs(input, target);
    printResult(res);
```