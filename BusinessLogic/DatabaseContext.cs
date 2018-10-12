using BusinessLogic.Model;
using System.Data.Entity;

namespace BusinessLogic
{
    public class DatabaseContext : DbContext
    {
        public DbSet<Content> Content { get; set; }
        public DbSet<Header> Header { get; set; }
        public DbSet<MailHeader> MailHeader { get; set; }
        public DbSet<Mail> Mail { get; set; }
        public DbSet<Seed> Seed { get; set; }
        public DbSet<Provider> Provider { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Client> Client { get; set; }
        public DbSet<SeedBucket> SeedBucket { get; set; }
        public DbSet<SeedBucketSeed> SeedBucketSeed { get; set; }
        public DbSet<ClientSeed> ClientSeed { get; set; }
        public DbSet<SeedLog> SeedLog { get; set; }
        public DbSet<RunLog> RunLog { get; set; }
        public DbSet<TemplateTest> TemplateTest { get; set; }
        public DbSet<MailClassWarmUp> MailClassWarmUp { get; set; }

        public DatabaseContext() : base("name=postgresDB")
        {
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            base.OnModelCreating(modelBuilder);
        }
    }
}
