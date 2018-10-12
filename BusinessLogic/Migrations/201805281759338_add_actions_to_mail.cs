namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_actions_to_mail : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "MarkMailAsRead", c => c.Boolean(nullable: false));
            AddColumn("dbo.Mails", "MoveMailToInbox", c => c.Boolean(nullable: false));
            AddColumn("dbo.Mails", "ReplyMail", c => c.Boolean(nullable: false));
            AddColumn("dbo.Mails", "ForwardMail", c => c.Boolean(nullable: false));
            AddColumn("dbo.Mails", "ClickMail", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Mails", "ClickMail");
            DropColumn("dbo.Mails", "ForwardMail");
            DropColumn("dbo.Mails", "ReplyMail");
            DropColumn("dbo.Mails", "MoveMailToInbox");
            DropColumn("dbo.Mails", "MarkMailAsRead");
        }
    }
}
