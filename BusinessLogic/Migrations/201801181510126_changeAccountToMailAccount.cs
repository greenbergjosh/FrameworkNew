namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class changeAccountToMailAccount : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.Accounts", newName: "MailAccounts");
        }
        
        public override void Down()
        {
            RenameTable(name: "dbo.MailAccounts", newName: "Accounts");
        }
    }
}
