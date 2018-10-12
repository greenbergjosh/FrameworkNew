namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class makeRequierdSeedBucket : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Clients", "CreatedAt", c => c.DateTime(nullable: false));
            AlterColumn("dbo.SeedBuckets", "Name", c => c.String(nullable: false));
            AlterColumn("dbo.SeedBuckets", "Description", c => c.String(nullable: false));
            AlterColumn("dbo.SeedBuckets", "CreatedAt", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.SeedBuckets", "CreatedAt", c => c.DateTime(nullable: false));
            AlterColumn("dbo.SeedBuckets", "Description", c => c.String());
            AlterColumn("dbo.SeedBuckets", "Name", c => c.String());
            AlterColumn("dbo.Clients", "CreatedAt", c => c.DateTime());
        }
    }
}
