namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addSeedApiLog : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.SeedApiLogs",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        CreatedAt = c.DateTime(nullable: false),
                        Client_Id = c.Guid(nullable: false),
                        Seed_Id = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Clients", t => t.Client_Id, cascadeDelete: true)
                .ForeignKey("dbo.Seeds", t => t.Seed_Id, cascadeDelete: true)
                .Index(t => t.Client_Id)
                .Index(t => t.Seed_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.SeedApiLogs", "Seed_Id", "dbo.Seeds");
            DropForeignKey("dbo.SeedApiLogs", "Client_Id", "dbo.Clients");
            DropIndex("dbo.SeedApiLogs", new[] { "Seed_Id" });
            DropIndex("dbo.SeedApiLogs", new[] { "Client_Id" });
            DropTable("dbo.SeedApiLogs");
        }
    }
}
