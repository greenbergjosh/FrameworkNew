namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_log_table : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Logs",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        LastRun = c.DateTime(nullable: false),
                        RemainingReplys = c.Int(nullable: false),
                        RemainingForwards = c.Int(nullable: false),
                        Seed_Id = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Seeds", t => t.Seed_Id, cascadeDelete: true)
                .Index(t => t.Seed_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Logs", "Seed_Id", "dbo.Seeds");
            DropIndex("dbo.Logs", new[] { "Seed_Id" });
            DropTable("dbo.Logs");
        }
    }
}
