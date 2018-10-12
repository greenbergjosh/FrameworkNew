namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class renameMailAccountToSeed : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.MailAccounts", newName: "Seeds");
        }
        
        public override void Down()
        {
            RenameTable(name: "dbo.Seeds", newName: "MailAccounts");
        }
    }
}
