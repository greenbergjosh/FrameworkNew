namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_index_runlog : DbMigration
    {
        public override void Up()
        {
            DropIndex("dbo.RunLogs", "Status&Description");
            CreateIndex("dbo.RunLogs", "RunTime");
            CreateIndex("dbo.RunLogs", "Status");
        }
        
        public override void Down()
        {
            DropIndex("dbo.RunLogs", new[] { "Status" });
            DropIndex("dbo.RunLogs", new[] { "RunTime" });
            CreateIndex("dbo.RunLogs", new[] { "Status", "Description" }, name: "Status&Description");
        }
    }
}
