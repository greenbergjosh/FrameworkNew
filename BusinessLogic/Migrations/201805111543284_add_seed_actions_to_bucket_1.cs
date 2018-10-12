namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_seed_actions_to_bucket_1 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SeedBuckets", "ReplySenderDomain", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.SeedBuckets", "ReplySenderDomain");
        }
    }
}
