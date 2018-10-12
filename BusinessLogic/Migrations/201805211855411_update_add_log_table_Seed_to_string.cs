namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_add_log_table_Seed_to_string : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Logs", "Seed_Id", "dbo.Seeds");
            DropIndex("dbo.Logs", "LastRun&Seed");
            DropIndex("dbo.Logs", new[] { "Seed_Id" });
            AddColumn("dbo.Logs", "SeedUserName", c => c.String(maxLength: 350));
            CreateIndex("dbo.Logs", new[] { "SeedUserName", "LastRun" }, name: "LastRun&Seed");
            DropColumn("dbo.Logs", "Seed_Id");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Logs", "Seed_Id", c => c.Guid());
            DropIndex("dbo.Logs", "LastRun&Seed");
            DropColumn("dbo.Logs", "SeedUserName");
            CreateIndex("dbo.Logs", "Seed_Id");
            CreateIndex("dbo.Logs", "LastRun", name: "LastRun&Seed");
            AddForeignKey("dbo.Logs", "Seed_Id", "dbo.Seeds", "Id");
        }
    }
}
