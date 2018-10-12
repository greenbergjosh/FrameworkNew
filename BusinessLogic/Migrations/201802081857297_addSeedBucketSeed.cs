namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addSeedBucketSeed : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.SeedBucketSeeds",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        CreatedAt = c.DateTime(nullable: false),
                        Seed_Id = c.Guid(),
                        SeedBucket_Id = c.Guid(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Seeds", t => t.Seed_Id)
                .ForeignKey("dbo.SeedBuckets", t => t.SeedBucket_Id)
                .Index(t => t.Seed_Id)
                .Index(t => t.SeedBucket_Id);
            
            AlterColumn("dbo.Clients", "CreatedAt", c => c.DateTime(nullable: false));
            AlterColumn("dbo.SeedBuckets", "CreatedAt", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.SeedBucketSeeds", "SeedBucket_Id", "dbo.SeedBuckets");
            DropForeignKey("dbo.SeedBucketSeeds", "Seed_Id", "dbo.Seeds");
            DropIndex("dbo.SeedBucketSeeds", new[] { "SeedBucket_Id" });
            DropIndex("dbo.SeedBucketSeeds", new[] { "Seed_Id" });
            AlterColumn("dbo.SeedBuckets", "CreatedAt", c => c.DateTime(nullable: false));
            AlterColumn("dbo.Clients", "CreatedAt", c => c.DateTime(nullable: false));
            DropTable("dbo.SeedBucketSeeds");
        }
    }
}
