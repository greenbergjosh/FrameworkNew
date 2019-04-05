namespace Utility.OpgAuth.Sso
{
    public class UserDetails
    {
        public UserDetails(string name, string email, string phone, string imageUrl, string raw)
        {
            Name = name;
            Email = email;
            Phone = phone;
            ImageUrl = imageUrl;
            Raw = raw;
        }

        public string Name { get; }
        public string Email { get; }
        public string Phone { get; }
        public string ImageUrl { get; }
        public string Raw { get; }
    }
}