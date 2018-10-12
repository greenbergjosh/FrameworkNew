namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class rename_SeedApiLog_to_ClientSeed : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.SeedApiLogs", newName: "ClientSeeds");
        }
        
        public override void Down()
        {
            RenameTable(name: "dbo.ClientSeeds", newName: "SeedApiLogs");
        }
    }
}
