namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_templateTest_info_to_mail : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "FromSeeder", c => c.Boolean(nullable: false));
            AddColumn("dbo.Mails", "TemplateTestID", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Mails", "TemplateTestID");
            DropColumn("dbo.Mails", "FromSeeder");
        }
    }
}
