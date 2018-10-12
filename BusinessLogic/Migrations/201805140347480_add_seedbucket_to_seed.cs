namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_seedbucket_to_seed : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Seeds", "SeedBucket_Id", c => c.Guid());
            CreateIndex("dbo.Seeds", "SeedBucket_Id");
            AddForeignKey("dbo.Seeds", "SeedBucket_Id", "dbo.SeedBuckets", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Seeds", "SeedBucket_Id", "dbo.SeedBuckets");
            DropIndex("dbo.Seeds", new[] { "SeedBucket_Id" });
            DropColumn("dbo.Seeds", "SeedBucket_Id");
        }
    }
}
