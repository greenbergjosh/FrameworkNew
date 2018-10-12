namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class refactorHeaderMailHeader : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Headers", "MailHeader_Id", "dbo.MailHeaders");
            DropIndex("dbo.Headers", new[] { "MailHeader_Id" });
            AddColumn("dbo.MailHeaders", "Seq", c => c.Int(nullable: false));
            AddColumn("dbo.MailHeaders", "Header_Id", c => c.Guid());
            CreateIndex("dbo.MailHeaders", "Header_Id");
            AddForeignKey("dbo.MailHeaders", "Header_Id", "dbo.Headers", "Id");
            DropColumn("dbo.Headers", "Seq");
            DropColumn("dbo.Headers", "MailHeader_Id");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Headers", "MailHeader_Id", c => c.Guid());
            AddColumn("dbo.Headers", "Seq", c => c.Int(nullable: false));
            DropForeignKey("dbo.MailHeaders", "Header_Id", "dbo.Headers");
            DropIndex("dbo.MailHeaders", new[] { "Header_Id" });
            DropColumn("dbo.MailHeaders", "Header_Id");
            DropColumn("dbo.MailHeaders", "Seq");
            CreateIndex("dbo.Headers", "MailHeader_Id");
            AddForeignKey("dbo.Headers", "MailHeader_Id", "dbo.MailHeaders", "Id");
        }
    }
}
