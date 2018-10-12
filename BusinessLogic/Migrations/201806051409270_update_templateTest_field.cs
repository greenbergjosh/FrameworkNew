namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_templateTest_field : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.TemplateTests", "Name", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.TemplateTests", "Name", c => c.Guid(nullable: false));
        }
    }
}
