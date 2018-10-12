namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_seed_actions_to_bucket : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SeedBuckets", "MarkMailAsRead", c => c.Boolean(nullable: false));
            AddColumn("dbo.SeedBuckets", "MoveMailToInbox", c => c.Boolean(nullable: false));
            AddColumn("dbo.SeedBuckets", "ReplayMail", c => c.Boolean(nullable: false));
            AddColumn("dbo.SeedBuckets", "ForwardMail", c => c.Boolean(nullable: false));
            AddColumn("dbo.SeedBuckets", "ClcikMail", c => c.Boolean(nullable: false));
            AddColumn("dbo.SeedBuckets", "ReplyLimit", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.SeedBuckets", "ReplyLimit");
            DropColumn("dbo.SeedBuckets", "ClcikMail");
            DropColumn("dbo.SeedBuckets", "ForwardMail");
            DropColumn("dbo.SeedBuckets", "ReplayMail");
            DropColumn("dbo.SeedBuckets", "MoveMailToInbox");
            DropColumn("dbo.SeedBuckets", "MarkMailAsRead");
        }
    }
}
