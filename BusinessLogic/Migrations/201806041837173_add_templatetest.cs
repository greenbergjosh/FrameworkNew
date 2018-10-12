namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_templatetest : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.TemplateTests",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        Name = c.Guid(nullable: false),
                        CreatedAt = c.DateTime(nullable: false),
                        CampaignId = c.String(),
                        Subject = c.String(),
                        Body = c.String(),
                        Result = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.TemplateTests");
        }
    }
}
