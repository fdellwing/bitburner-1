/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    var a = removeInvalidParenthesis(")((aaa)))");
    for(let s of a){
        ns.tprint(s);
    }
}

function isParenthesis(c)
{
    return ((c == '(') || (c == ')'));
}
 
// method returns true if string contains valid
// parenthesis
function isValidString(str)
{
    let cnt = 0;
    for (let i = 0; i < str.length; i++)
    {
        if (str[i] == '(')
            cnt++;
        else if (str[i] == ')')
            cnt--;
        if (cnt < 0)
            return false;
    }
    return (cnt == 0);
}
 
// method to remove invalid parenthesis
function removeInvalidParenthesis(str)
{
    var res=[];
    if (str.length==0)
        return res;
   
    // visit set to ignore already visited string
    let visit = new Set();
   
    // queue to maintain BFS
    let q = [];
    let temp;
    let level = false;
   
    q.push(str);
    visit.add(str);
    while (q.length!=0)
    {
        str = q.shift();
        if (isValidString(str))
        {
            res.push(str)
            level = true;
        }
        if (level)
            continue;
        for (let i = 0; i < str.length; i++)
        {
            if (!isParenthesis(str[i]))
                continue;
   
            temp = str.substring(0, i) + str.substring(i + 1);
            if (!visit.has(temp))
            {
                q.push(temp);
                visit.add(temp);
            }
        }
    }
    return res;
}