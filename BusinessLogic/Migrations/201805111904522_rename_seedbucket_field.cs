namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class rename_seedbucket_field : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SeedBuckets", "ReplyMail", c => c.Boolean(nullable: false));
            DropColumn("dbo.SeedBuckets", "ReplayMail");
        }
        
        public override void Down()
        {
            AddColumn("dbo.SeedBuckets", "ReplayMail", c => c.Boolean(nullable: false));
            DropColumn("dbo.SeedBuckets", "ReplyMail");
        }
    }
}
