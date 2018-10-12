using BusinessLogic.Model;
using System.Data.Entity;

namespace BusinessLogic
{
    public class CredentialContext : DbContext
    {


        public DbSet<UserProfile> UserProfiles { get; set; }


        public CredentialContext() : base("name=database")
        {
        }
    }
}
