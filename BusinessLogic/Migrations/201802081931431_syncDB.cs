namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class syncDB : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.SeedBucketSeeds", "CreatedAt", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.SeedBucketSeeds", "CreatedAt", c => c.DateTime(nullable: false));
        }
    }
}
