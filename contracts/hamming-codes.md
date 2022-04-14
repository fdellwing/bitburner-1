Solving the hamming code contracts has been a complete mindfuck. I've found a number of 
hamming code implementations on the internet but each is different, and most did not 
give the same answer as the description of the contract. It seems that most people like 
me find the wikipedia description a bit ambiguous. In any case, I found the code below
on geeksforgeeks, and it seems to give almost the right encoding answer, but is missing
the first parity bit. I don't understand that, but this is close. 

MINE: 11100111001
UMAS: 10110010110

https://www.geeksforgeeks.org/hamming-code-implementation-in-java/

```
/*package whatever //do not write package name here */

import java.io.*;


// Java code to implement Hamming Code
class HammingCode {
  
    // print elements of array
    static void print(int ar[])
    {
        for (int i = 1; i < ar.length; i++) {
            System.out.print(ar[i]);
        }
        System.out.println();
    }
  
    // calculating value of redundant bits
    static int[] calculation(int[] ar, int r)
    {
        for (int i = 0; i < r; i++) {
            int x = (int)Math.pow(2, i);
            for (int j = 1; j < ar.length; j++) {
                if (((j >> i) & 1) == 1) {
                    if (x != j)
                        ar[x] = ar[x] ^ ar[j];
                }
            }
            System.out.println("r" + x + " = "
                               + ar[x]);
        }
  
        return ar;
    }
  
    static int[] generateCode(String str, int M, int r)
    {
        int[] ar = new int[r + M + 1];
        int j = 0;
        for (int i = 1; i < ar.length; i++) {
            if ((Math.ceil(Math.log(i) / Math.log(2))
                 - Math.floor(Math.log(i) / Math.log(2)))
                == 0) {
  
                // if i == 2^n for n in (0, 1, 2, .....)
                // then ar[i]=0
                // codeword[i] = 0 ----
                // redundant bits are initialized
                // with value 0
                ar[i] = 0;
            }
            else {
  
                // codeword[i] = dataword[j]
                ar[i] = (int)(str.charAt(j) - '0');
                j++;
            }
        }
        return ar;
    }
  
    // Driver code
    public static void main(String[] args)
    {
  
        // input message
        String str = "10101";
        int M = str.length();
        int r = 1;
  
        while (Math.pow(2, r) < (M + r + 1)) {
            // r is number of redundant bits
            r++;
        }
        int[] ar = generateCode(str, M, r);
  
        System.out.println("Generated hamming code ");
        ar = calculation(ar, r);
        print(ar);
    }
}
```