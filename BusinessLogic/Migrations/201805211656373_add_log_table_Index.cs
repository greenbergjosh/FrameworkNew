namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_log_table_Index : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Logs", "Seed_Id", "dbo.Seeds");
            DropIndex("dbo.Logs", new[] { "Seed_Id" });
            AlterColumn("dbo.Logs", "Seed_Id", c => c.Guid());
            CreateIndex("dbo.Logs", "LastRun", name: "LastRun&Seed");
            CreateIndex("dbo.Logs", "Seed_Id");
            AddForeignKey("dbo.Logs", "Seed_Id", "dbo.Seeds", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Logs", "Seed_Id", "dbo.Seeds");
            DropIndex("dbo.Logs", new[] { "Seed_Id" });
            DropIndex("dbo.Logs", "LastRun&Seed");
            AlterColumn("dbo.Logs", "Seed_Id", c => c.Guid(nullable: false));
            CreateIndex("dbo.Logs", "Seed_Id");
            AddForeignKey("dbo.Logs", "Seed_Id", "dbo.Seeds", "Id", cascadeDelete: true);
        }
    }
}
