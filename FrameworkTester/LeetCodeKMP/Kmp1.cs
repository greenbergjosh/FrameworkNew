using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Rubjerg.Graphviz;

namespace LeetCode
{
    // https://www.thecriticalcoder.com/knuth-morris-pratt-kmp-algorithm-illustrated-explanation-with-python-code-implementation/
    // https://www.cs.cmu.edu/~avrim/451f13/lectures/lect1121.pdf
    // https://www.cs.cmu.edu/~15451-f17/lectures/lec09-kmp.pdf

    // KMP is a DFA. Does the DFA ever behave differently depending on the mismatched character or is the behavior
    // always just a binary question of matched/unmatched?
    public class Kmp1
	{
        Dictionary<char, int> alphaDict = new Dictionary<char, int>();
        int[,] dfa;
        string alphabet;
        string pattern;

        int[] memo;


        public Kmp1(string pattern, string alphabet)
		{
            // Saved for pretty-printing
            this.alphabet = alphabet;
            this.pattern = pattern;

            // Create a dictionary mapping all allowable characters
            // in the alphabet to sequential integers
            int a = 0;
            foreach (var c in alphabet) alphaDict[c] = a++;

            // The dfa is a 2D table
            dfa = new int[alphabet.Length, pattern.Length];
            dfa[alphaDict[pattern[0]], 0] = 1;
            for (int X = 0, j = 1; j < pattern.Length; j++)
            {
                // This occurence of the state behaves identically to the previous occurence of this state
                for (int c = 0; c < alphabet.Length; c++)
                    dfa[c,j] = dfa[c,X];
                // Except for where it matches
                dfa[alphaDict[pattern[j]], j] = j + 1;
                // Update the previous state
                X = dfa[alphaDict[pattern[j]], X];
            }

            CmuMemoZeroIndexed(pattern);
        }

        public int Search(string txt)
        {
            for (int i = 0, j = 0; i < txt.Length; i++)
            {
                j = dfa[alphaDict[txt[i]], j];
                if (j == dfa.GetLength(1)) return i - j;
            }
            return -1;
        }

        /*  memo[i] will store the length of the longest prefix of P
            that matches the tail of P2...Pi */
        public void CmuMemo(string pattern)
        {
            memo = new int[pattern.Length + 1];
            int j = 0;
            for (int i = 2; i <= pattern.Length; i++)
            {
                while (j > 0 && pattern[i] != pattern[j + 1]) j = memo[j];
                if (pattern[i] == pattern[j + 1]) j++;
                memo[i] = j;
            }

        }

        public void WriteDebug(string pattern, int i, int j)
        {
            Console.WriteLine($"i={i}, j={j}");
            Console.WriteLine(pattern);
            Console.WriteLine("^".PadLeft(i+1));
            Console.WriteLine(pattern.PadLeft(pattern.Length + i));
            Console.WriteLine("^".PadLeft(i + j + 1));
        }

        public void WriteMemo(int i)
        {
            Console.WriteLine($"[{string.Join(",", memo)}]");
            Console.WriteLine("^".PadLeft(2 * i + 2));
        }

        public void CmuMemoZeroIndexed(string pattern)
        {
            memo = new int[pattern.Length];
            int j = 0;
            WriteMemo(0);
            Console.WriteLine("----------------------------");
            for (int i = 1; i < pattern.Length; i++)
            {
                WriteDebug(pattern, i, j);
                while (j > 0 && pattern[i] != pattern[j]) { Console.WriteLine($"No match, j = memo[{j - 1}] = {memo[j-1]}"); j = memo[j - 1]; WriteDebug(pattern, i, j); }
                if (pattern[i] == pattern[j]) { j++; Console.WriteLine($"Match, j++, j={j}"); }
                memo[i] = j; WriteMemo(i);
                Console.WriteLine("----------------------------");
            }
        }

        public void CmuMemoZeroIndexedUncommented(string pattern)
        {
            memo = new int[pattern.Length];
            int j = 0;
            for (int i = 1; i < pattern.Length; i++)  // moves i forward
            {                   //txt
                while (j > 0 && pattern[i] != pattern[j]) j = memo[j - 1];  // moves j backwards, stops at j = 0
                if (pattern[i] == pattern[j]) j++;  // moves j forward, always true if j > 0
                memo[i] = j; // j always increments by 1, or it goes backwards
            }
        }

        //     j
        //012345678901234567890123    
        //abcabeabcabcabcabeabcabg
        //abcabeabcabcabcabeabcabg
        //           i
        //000120123453
        //memo
        //The current match is 5 long, so j is at 5, what is the meaning of the value in memo[4]/memo[j-1]
        // memo[4]=2 and pattern[memo[4]]=pattern[2]=c
        // I already matched ab, I want to know, now, if I match c
        // Somehow a state machine is being created in memo

        //      j
        //012345678901234567890123    
        //abcabeabcabedbcabeabcabg
        //abcabeabcabedbcabeabcabg
        //            i
        //000120123456
        //memo
        //The current match is 5 long, so j is at 5, what is the meaning of the value in memo[4]/memo[j-1]
        // memo[4]=2 and pattern[memo[4]]=pattern[2]=c
        // I already matched ab, I want to know, now, if I match c
        // Somehow a state machine is being created in memo

        public void CmuSearchZeroIndexed(string txt)
        {
            int j = 0;
            for (int i = 0; i < txt.Length; i++)
            {
                while (j > 0 && txt[i] != pattern[j]) j = memo[j - 1];
                if (txt[i] == pattern[j]) j++;
                if (j == pattern.Length)
                {
                    Console.WriteLine("match found at " + (i - pattern.Length + 1));
                    j = memo[j - 1];
                }
            }
        }

        public void CmuSearch(string txt)
        {
            // Assume strings are 1-indexed
            int j = 0; // position in pattern
            for (int i = 1; i <= txt.Length; i++)
            {
                while (j > 0 && txt[i] != pattern[j + 1]) j = memo[j]; // mismatch edge
                if (txt[i] == pattern[j + 1]) j++;  // match edge
                if (j == pattern.Length) // end state
                {
                    Console.WriteLine("match found at " + (i - pattern.Length + 1));
                    j = memo[j];
                }
            }
        }

        

        /*
         abcabeabcabf
         ZeroedMemo:
       a   b   c   a   b   e   a   b   c   a   b   f
       0   1   2   3   4   5   6   7   8   9   10  11
       0   0   0   1   2   0   1   2   3   4   5   0       original
       0   0   0   0   2   0   0   0   0   0   5   0       zeroed for efficiency
           0   0   0   1   2   0   1   2   3   4   5   0   original shifted
           1   1   1   1   3   1   1   1   1   1   6   1   incremented and shifted to match
           0   1   0   0   3   0   0   0   0   0   6   1   shifted to match
       1   2   3   4   5   6   7   8   9   10  11  12
         Memo:
       a   b   c   a   b   e   a   b   c   a   b   f
       0   1   2   3   4   5   6   7   8   9   10  11
       0   0   0   1   2   0   1   2   3   4   5   0
match found at 0
match found at 24
match found at 48
       a   b   c   a   b   e   a   b   c   a   b   f
   a   1   1   1   4   1   1   7   1   1  10   1   1
   b   0   2   0   0   5   0   0   8   0   0  11   0
   c   0   0   3   0   0   3   0   0   9   0   0   3
   e   0   0   0   0   0   6   0   0   0   0   0   6
   f   0   0   0   0   0   0   0   0   0   0   0  12
         */

        public void PrintMemo()
        {
            Console.WriteLine("Memo:");
            Console.Write("".PadLeft(4));
            foreach (var i in memo)
            {
                Console.Write(i.ToString().PadLeft(4));
            }
            Console.WriteLine();
        }

        public void PrintDfa()
        {
            Console.Write("".PadLeft(4));
            foreach (var c in pattern) Console.Write(c.ToString().PadLeft(4));
            Console.WriteLine();

            for (int i = 0; i < dfa.GetLength(0); i++)
            {
                Console.Write(alphabet[i].ToString().PadLeft(4));
                for (int j = 0; j < dfa.GetLength(1); j++)
                {
                    Console.Write(dfa[i, j].ToString().PadLeft(4));
                }
                Console.WriteLine();
            }
        }

        public void PrintGraphvizDotDoc()
        {
            
            Console.WriteLine(@"
                digraph finite_state_machine {
	            fontname=""Helvetica,Arial,sans-serif""
	            node [fontname=""Helvetica,Arial,sans-serif""]
	            edge [fontname=""Helvetica,Arial,sans-serif""]
	            rankdir=LR;");
            
            Console.WriteLine(@"node [shape = circle];");

            for (int j = 0; j < dfa.GetLength(1)+1; j++)
            {
                // 12 [label = "12",shape = doublecircle]
                Console.WriteLine(@$"{j} [label = ""{j}"" {(j == dfa.GetLength(1) ? ",shape = doublecircle" : "")}]");
            }

            for (int j = 0; j < dfa.GetLength(1); j++)
            {
                var d = new Dictionary<(int, int), string>();
                for (int i = 0; i < dfa.GetLength(0); i++)
                {
                    if (d.ContainsKey((j, dfa[i, j])))
                    {
                        d[(j, dfa[i, j])] += "," + alphabet[i];
                    }
                    else
                    {
                        d.Add((j, dfa[i, j]), alphabet[i].ToString());
                    }
                }
                foreach (var kvp in d)
                {
                    Console.WriteLine(@$"{kvp.Key.Item1} -> {kvp.Key.Item2} [label = ""{kvp.Value}""];");
                }
            }
            Console.WriteLine("}");
        }

        public void GraphvizDotDoc(string fileName)
        {
            StringBuilder sb = new StringBuilder(@"
                digraph finite_state_machine {
	            fontname=""Helvetica,Arial,sans-serif""
	            node [fontname=""Helvetica,Arial,sans-serif""]
	            edge [fontname=""Helvetica,Arial,sans-serif""]
	            rankdir=LR;" + Environment.NewLine);

            sb.Append(@"node [shape = circle];" + Environment.NewLine);

            for (int j = 0; j < dfa.GetLength(1) + 1; j++)
            {
                sb.Append(@$"{j} [label = ""{j}"" {(j == dfa.GetLength(1) ? ",shape = doublecircle" : "")}]" + Environment.NewLine);
            }

            for (int j = 0; j < dfa.GetLength(1); j++)
            {
                var d = new Dictionary<(int, int), string>();
                for (int i = 0; i < dfa.GetLength(0); i++)
                {
                    if (d.ContainsKey((j, dfa[i, j])))
                    {
                        d[(j, dfa[i, j])] += "," + alphabet[i];
                    }
                    else
                    {
                        d.Add((j, dfa[i, j]), alphabet[i].ToString());
                    }
                }
                foreach (var kvp in d)
                {
                    sb.Append(@$"{kvp.Key.Item1} -> {kvp.Key.Item2} [label = ""{kvp.Value}""];" + Environment.NewLine);
                }
            }
            sb.Append("}");

            string path = Directory.GetCurrentDirectory();
            //RootGraph root = RootGraph.FromDotFile(path + "/" + fileName);
            RootGraph root = RootGraph.FromDotString(sb.ToString());
            root.ComputeLayout();
            root.ToSvgFile(path + "/" + fileName);

            //return sb.ToString();
        }
    }
}

