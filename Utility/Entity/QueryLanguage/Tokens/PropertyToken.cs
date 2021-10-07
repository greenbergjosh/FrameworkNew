namespace Utility.Entity.QueryLanguage.Tokens
{
    public class PropertyToken : Token
    {
        public string Name { get; init; }
        public static PropertyToken Wildcard => new(null);

        public PropertyToken(string name)
        {
            Name = name;
        }

        public override string ToString() => $".{Name ?? "*"}";
    }
}
