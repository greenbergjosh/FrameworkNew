namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_mail_into_templateTest : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.TemplateTests", "Mail_Id", c => c.Guid());
            CreateIndex("dbo.TemplateTests", "Mail_Id");
            AddForeignKey("dbo.TemplateTests", "Mail_Id", "dbo.Mails", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.TemplateTests", "Mail_Id", "dbo.Mails");
            DropIndex("dbo.TemplateTests", new[] { "Mail_Id" });
            DropColumn("dbo.TemplateTests", "Mail_Id");
        }
    }
}
