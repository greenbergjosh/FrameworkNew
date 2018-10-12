namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_SeedBucket_to_ClientSeed : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.ClientSeeds", "SeedBucket_Id", c => c.Guid());
            CreateIndex("dbo.ClientSeeds", "SeedBucket_Id");
            AddForeignKey("dbo.ClientSeeds", "SeedBucket_Id", "dbo.SeedBuckets", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.ClientSeeds", "SeedBucket_Id", "dbo.SeedBuckets");
            DropIndex("dbo.ClientSeeds", new[] { "SeedBucket_Id" });
            DropColumn("dbo.ClientSeeds", "SeedBucket_Id");
        }
    }
}
