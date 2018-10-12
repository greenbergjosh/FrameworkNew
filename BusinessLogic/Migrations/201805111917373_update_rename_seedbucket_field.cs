namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_rename_seedbucket_field : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SeedBuckets", "ClickMail", c => c.Boolean(nullable: false));
            DropColumn("dbo.SeedBuckets", "ClcikMail");
        }
        
        public override void Down()
        {
            AddColumn("dbo.SeedBuckets", "ClcikMail", c => c.Boolean(nullable: false));
            DropColumn("dbo.SeedBuckets", "ClickMail");
        }
    }
}
