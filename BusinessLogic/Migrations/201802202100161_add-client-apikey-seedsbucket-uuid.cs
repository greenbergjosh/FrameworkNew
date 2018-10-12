namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addclientapikeyseedsbucketuuid : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Clients", "ApiKey", c => c.String(nullable: false));
            AddColumn("dbo.SeedBuckets", "UUID", c => c.Guid(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.SeedBuckets", "UUID");
            DropColumn("dbo.Clients", "ApiKey");
        }
    }
}
