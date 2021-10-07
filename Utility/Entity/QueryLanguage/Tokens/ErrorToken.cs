namespace Utility.Entity.QueryLanguage.Tokens
{
    internal class ErrorToken : Token
    {
        public string Message { get; init; }

        public ErrorToken(string message)
        {
            Message = message;
        }
    }
}
