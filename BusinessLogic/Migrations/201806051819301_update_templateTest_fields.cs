namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_templateTest_fields : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.TemplateTests", "BodyText", c => c.String());
            AddColumn("dbo.TemplateTests", "HTML", c => c.String());
            AddColumn("dbo.TemplateTests", "To", c => c.String());
            DropColumn("dbo.TemplateTests", "Body");
        }
        
        public override void Down()
        {
            AddColumn("dbo.TemplateTests", "Body", c => c.String());
            DropColumn("dbo.TemplateTests", "To");
            DropColumn("dbo.TemplateTests", "HTML");
            DropColumn("dbo.TemplateTests", "BodyText");
        }
    }
}
