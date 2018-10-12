namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class rename_log_table : DbMigration
    {
        public override void Up()
        {
            DropIndex("dbo.Logs", "LastRun&Seed");
            CreateTable(
                "dbo.SeedLogs",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        LastRun = c.DateTime(nullable: false),
                        Seed_Id = c.Guid(nullable: false),
                        RemainingReplys = c.Int(nullable: false),
                        RemainingForwards = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .Index(t => new { t.Seed_Id, t.LastRun }, name: "LastRun&Seed");
            
            DropTable("dbo.Logs");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.Logs",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        LastRun = c.DateTime(nullable: false),
                        SeedUserName = c.String(maxLength: 350),
                        RemainingReplys = c.Int(nullable: false),
                        RemainingForwards = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            DropIndex("dbo.SeedLogs", "LastRun&Seed");
            DropTable("dbo.SeedLogs");
            CreateIndex("dbo.Logs", new[] { "SeedUserName", "LastRun" }, name: "LastRun&Seed");
        }
    }
}
