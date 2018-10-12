namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class changeAccountToSeed : DbMigration
    {
        public override void Up()
        {
            RenameColumn(table: "dbo.Mails", name: "Account_Id", newName: "Seed_Id");
            RenameIndex(table: "dbo.Mails", name: "IX_Account_Id", newName: "IX_Seed_Id");
        }
        
        public override void Down()
        {
            RenameIndex(table: "dbo.Mails", name: "IX_Seed_Id", newName: "IX_Account_Id");
            RenameColumn(table: "dbo.Mails", name: "Seed_Id", newName: "Account_Id");
        }
    }
}
