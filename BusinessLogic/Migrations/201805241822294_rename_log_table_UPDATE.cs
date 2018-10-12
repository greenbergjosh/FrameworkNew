namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class rename_log_table_UPDATE : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SeedLogs", "NumReplys", c => c.Int(nullable: false));
            AddColumn("dbo.SeedLogs", "NumForwards", c => c.Int(nullable: false));
            DropColumn("dbo.SeedLogs", "RemainingReplys");
            DropColumn("dbo.SeedLogs", "RemainingForwards");
        }
        
        public override void Down()
        {
            AddColumn("dbo.SeedLogs", "RemainingForwards", c => c.Int(nullable: false));
            AddColumn("dbo.SeedLogs", "RemainingReplys", c => c.Int(nullable: false));
            DropColumn("dbo.SeedLogs", "NumForwards");
            DropColumn("dbo.SeedLogs", "NumReplys");
        }
    }
}
