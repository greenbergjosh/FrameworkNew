namespace Utility.OpgAuth.Sso
{
    public class UserDetails
    {
        public UserDetails(string id, string name, string email, string phone, string imageUrl, string raw)
        {
            Name = name;
            Email = email;
            Phone = phone;
            ImageUrl = imageUrl;
            Raw = raw;
            Id = id;
        }


        public string Id { get; }
        public string Name { get; }
        public string Email { get; }
        public string Phone { get; }
        public string ImageUrl { get; }
        internal string Raw { get; }
        public string LoginToken { get; internal set; }
    }
}