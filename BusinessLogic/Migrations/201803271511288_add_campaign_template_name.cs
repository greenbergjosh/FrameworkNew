namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_campaign_template_name : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "CampaignName", c => c.String());
            AddColumn("dbo.Mails", "TemplateName", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Mails", "TemplateName");
            DropColumn("dbo.Mails", "CampaignName");
        }
    }
}
