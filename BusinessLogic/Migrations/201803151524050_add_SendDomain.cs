namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_SendDomain : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "SendDomain", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Mails", "SendDomain");
        }
    }
}
