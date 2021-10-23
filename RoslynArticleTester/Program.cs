namespace RoslynArticleTester
{
    internal class Program
    {
        private static void Main(string[] args) => SsisWrapper.SsisWrapper.ExecutePackage(
                @"C:\Program Files\Microsoft SQL Server\140\DTS\Binn\dtexec",
                @"E:\Visual Studio 2017\RoslynArticle\SSISWrapperTest2\bin\Debug\pkg-360428e0-2ee7-4c59-b3c4-2a503df52958.dtsx",
                @"Data Source=.;Initial Catalog=Unsub;Integrated Security=SSPI;",
                null
            ).GetAwaiter().GetResult();
    }
}
