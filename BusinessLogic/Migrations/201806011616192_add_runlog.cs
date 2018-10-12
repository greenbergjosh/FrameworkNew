namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_runlog : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.RunLogs",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        RunTime = c.DateTime(nullable: false),
                        Status = c.String(nullable: false, maxLength: 50),
                        Description = c.String(nullable: false, maxLength: 250),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => new { t.Status, t.Description }, name: "Status&Description");
            
        }
        
        public override void Down()
        {
            DropIndex("dbo.RunLogs", "Status&Description");
            DropTable("dbo.RunLogs");
        }
    }
}
