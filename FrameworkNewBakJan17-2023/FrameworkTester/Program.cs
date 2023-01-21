using System.Text.RegularExpressions;
using Framework.Core;
using Framework.Core.Evaluatable;
using LeetCode;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Rubjerg.Graphviz;



Console.WriteLine("Here");
// Running RoslynWrapper on its own
// Roslyn is the first step. It simply allows execution of code snippets.
var _roslyn = new RoslynWrapper<Glb, int>("");

string code = """
    int y=4;
    return p["x"]+y;
    """;
int z = await _roslyn.Evaluate(code,
    new Glb() { p = new Dictionary<string, int> { ["x"]=3 } }
);
int ccc = 0;

// Now, why do we take EvaluateRequest and return EvaluateResponse - should these both be Entity


/*
string pattern = "1110111101";
string alphabet = "01";
var k = new LeetCode.Kmp1(pattern, alphabet);
k.PrintDfa();
k.PrintMemo();
*/


//var k = new LeetCode.Kmp1("ABABAC", "ABC");
//string pattern = "abcabeabcabfabcabeabcabg";
//string pattern = "abcdefghi";    // 0   0   0   0   0   0   0   0   0
//string pattern = "abcaefghi";    // 0   0   0   1   0   0   0   0   0
//PcPR
//string pattern = "abcabfghi";    // 0   0   0   1   2   0   0   0   0
//PcQPQR - only matches against the prefix matter - PxPy
//string pattern = "abcfgabfghi";    // 0   0   0   0   0   1   2   0   0   0   0
//PxPyPz
//string pattern = "abcfgabfgabfg";  // 0   0   0   0   0   1   2   0   0   1   2   0   0
//PxWPy, P=ab x=c W=de y=h
//                                 a   b   c   d   e   a   b   h
//string pattern = "abcdeabh";  // 0   0   0   0   0   1   2   0
//PxWPy, W=null
//string pattern = "abcabh";    // 0   0   0   1   2   0
//PxWPy, W=null, x=null, y=null
//string pattern = "abab";      // 0   0   1   2
//RaRxWRaRy
//                                     a   b   c   a   b   d   e   f   a   b   c   a   b   g
//string pattern = "abcabdefabcabg";  // 0   0   0   1   2   0   0   0   1   2   3   4   5   0
//ScSdVShSiWScSaVSbSy
//P=QR, P=abc, Q=ab R=c
//PQdefQhQijPQdefQhQik letting Z=PQ eliminates P, but not Q 
//ZdefQhQijZdefQhQik
// 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34
// a   b   c   a   b   d   e   f   a   b   h   a   b   i   j   a   b   c   a   b   d   e   f   a   b   h   a   b   i   k
// 0   0   0   1   2   0   0   0   1   2   0   1   2   0   0   1   2   3   4   5   6   7   8   9  10  11  12  13  14   0
//string pattern = "abcabdefabhabijabcabdefabhabik";
//P=QR
//PQePQfPQePQg letting Z=PQ eliminates P and Q
//ZeZfZeZg
//0   0   0   1   2   0   1   2   3   4   5   0   1   2   3   4   5   6   7   8   9  10  11   0
//a   b   c   a   b   e   a   b   c   a   b   f   a   b   c   a   b   e   a   b   c   a   b   g
//string pattern = "abcabeabcabfabcabeabcabg";
//P=QR, P=abc, Q=ab R=c
//PQePPPQePQg, letting Z=PQ eliminates Q, but not P
//ZePPZeZg
//ZeZcZcQg
//0   0   0   1   2   0   1   2   3   4   5   3   4   5   3   4   5   6   7   8   9  10  11   0
//a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   e   a   b   c   a   b   g
//string pattern = "abcabeabcabcabcabeabcabg";
//0   1   2   3   4   5   6   7   0
//a   a   a   a   a   a   a   a   b
//string pattern = "aaaaaaaab";
//0   0   0   0   1   2   3   4   5   6   7   8   9  10  11  12   0
//a   b   c   d   a   b   c   d   a   b   c   d   a   b   c   d   e   
//string pattern = "abcdabcdabcdabcde";
//0   0   0   0   1   2   3   1   2   1   0
//a   b   c   d   a   b   c   a   b   a   e
//string pattern = "abcdabcabae";
//RaRb, ScSdaScSdb, TeTfcTeTfaTeTfcTeTfb
//0   0   0   0   1   2   3   0
//l   m   n   a   l   m   n   b
//string pattern = "lmnalmnb";
//0   0   0   0   1   2   3   0   0   1   2   3   4   5   6   7   8   0
//l   m   n   c   l   m   n   d   a   l   m   n   c   l   m   n   d   b
//string pattern = "lmnclmndalmnclmndb";
// 0   0   0   0   1   2   3   0   0   1   2   3   4   5   6   7   8   0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17
// l   m   n   e   l   m   n   f   c   l   m   n   e   l   m   n   f   a   l   m   n   e   l   m   n   f   c   l   m   n   e   l   m   n   f
// 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34
//string pattern = "lmnelmnfclmnelmnfalmnelmnfclmnelmnf";
//0   0   0   1   2   3   4   5   6   0   1   2   3   0   1   2   3   4   5   6   7   8   9  10  11  12  13   0
//l   m   n   l   m   n   l   m   n   a   l   m   n   b   l   m   n   l   m   n   l   m   n   a   l   m   n   c
//string pattern = "lmnlmnlmnalmnblmnlmnlmnalmnc";
//0   0   0   1   2   0   1   2   3   4   5   3   4   5   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18   0
//a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   e   g
//string pattern = "abcabeabcabcabcabeabcabcabcabeg";
//0   0   0   1   2   0   1   2   3   4   5   3   4   5   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17   1   2   3   4   5   3   0   0
//a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   a   b   c   a   b   c   e   g
//string pattern = "abcabeabcabcabcabeabcabcabcababcabceg";
//0   0   0   1   2   0   1   2   3   4   5   0   1   2   3   4   5   6   7   8   9  10  11   3   4   5   0
//a   b   c   a   b   e   a   b   c   a   b   f   a   b   c   a   b   e   a   b   c   a   b   c   a   b   0
//string pattern = "abcabeabcabfabcabeabcabcabg";
//0   0   0   1   2   0   1   2   3   4   5   3   4   5   3   4   5   6   7   8   9  10  11  12  13  14   0
//a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   e   a   b   c   a   b   c   a   b   g
//string pattern = "abcabeabcabcabcabeabcabcabg";
//0   0   0   1   2   0   1   2   3   4   5   3   4   5   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17   3   4   5   0
//a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   e   a   b   c   a   b   c   a   b   c   a   b   c   a   b   g
//0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34
//string pattern = "abcabeabcabcabcabeabcabcabcabcabg";
// 0   0   0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
// a   b   c   a   b   c   a   b   c   a   b   c   a   b   c   a   b   c
//string pattern = "abcabcabcabcabcabc";
// 0   0   0   0   0   1   2   3   1   2   3   4   5   6   7   8
// a   b   c   d   e   a   b   c   a   b   c   d   e   a   b   c
//string pattern = "abcdeabcabcdeabc";

//string pattern = "abcdefabcdegabcdefabcdefabcde";
//string pattern = "abcdefabcdegabcdefabcdef";  //Pf Pg PfPf
//string pattern = "abcdeffabcdegfabcdeffabcdefh";  //PffPgfPffPfh  Rf Pgf RfRh
// The value in memo[i] is the matching-run-length achieved at pattern[1..i]
// Somehow, searching for pattern[0..n] in pattern[1..n] allows the memo/dfa to be built
// The memo/dfa built in this way can be used when searching for pattern[0..n] in text
string pattern = "abcabdefabcabcabch";
                  

// Searching for pattern[0..n] in text
// We always move forward in text (or sit still in text, and move the pattern backwards)


//string alphabet = "abcdefghijklmn";
//string pattern = "abcabeabcabcabcabeabcabg";  //"abcabeabcabfabcabeabcabg";//"abcabeabcabf";
string alphabet = "abcdefghijklmn";
var k = new LeetCode.Kmp1(pattern, alphabet);
k.PrintGraphvizDotDoc();
k.PrintMemo();
//k.GraphvizDotDoc("test1.svg");
string txt = "abcabeabcabfabcabeabcabhabcabeabcabfabcabeabcabgabcabeabcabfabcabeabcabi";
k.CmuSearchZeroIndexed(txt);
int pos = k.Search(txt);
k.PrintDfa();
Console.WriteLine();
Console.WriteLine(txt);
Console.WriteLine("^".PadLeft(pos+2));
Console.WriteLine(pattern.PadLeft(pos + pattern.Length + 1));

// PaPb
// RxRyaRxRyb
// P --> 0,...,0
// PaPb --> 0,..0,1,..|P|,0
//     --> 1,2,3,4,5,3,4,5
//     --> 1...17,8,5,3,4,5  - can I ever go down twice  7, 5, 3










await new Framework.Core.Tests.Entity.EntityTest().EvaluatePlusOneFromConfigDb();

Console.WriteLine("Hello");

int[] nums1 = new int[7] { 10, 20, 25, 26, 50, 51, 60 };
int[] nums2 = new int[8] { 11, 13, 29, 32, 33, 34, 53, 59 };
Console.WriteLine(FindMedianSortedArraysImperative.FindMedianSortedArrays(nums1, nums2));
Console.WriteLine(FindMedianSortedArraysFunctional1.FindMedianSortedArrays(nums1, nums2));
Console.WriteLine(FindMedianSortedArraysFunctional2.FindMedianSortedArrays(nums1, nums2));
Console.WriteLine(FindMedianSortedArraysFunctional3.FindMedianSortedArrays(nums1, nums2));
Console.WriteLine(FindMedianSortedArraysFunctional4.FindMedianSortedArrays(nums1, nums2));
Console.WriteLine(FindMedianSortedArraysFunctional5.FindMedianSortedArrays(nums1, nums2));
Console.WriteLine(FindMedianSortedArraysFunctional6.FindMedianSortedArrays(nums1, nums2));



// What is a sample program that highlights the benefits of the framework
// What shows that the framework is more flexible

// A static series of items (Sequence)
// On each item, a static series of items (Nested sequence)
// Select the different items (Conditionals)
// Iteration
// Yielding
// Historical navigation
// Parallel navigation each with history
// CMS-style composition
// Events, Aggregation, Reporting, etc. (CAP, Inversion, ...)
// IGenericEntity/Evaluatable (what is this? lifting?) (Graph, Cache, Poking, ...)
// Offer, Page,
// Customer service UI with sticky agents based on signals
// Extend into UI design, with react module federation and navtree pruning/sharing

// We start with some static version that cannot yield and has no history
// Then, piece by piece we add in the parts of the framework that get us to the full version

// Customer journey
// Start simple
// 1. show one static page to the consumer
// 2. show one question to a call center agent
// 3. load one file into a database, one time
public class Glb {
    public Dictionary<string, int>? p;
};