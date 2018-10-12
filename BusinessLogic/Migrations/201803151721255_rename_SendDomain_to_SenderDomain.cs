namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class rename_SendDomain_to_SenderDomain : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "SenderDomain", c => c.String());
            DropColumn("dbo.Mails", "SendDomain");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Mails", "SendDomain", c => c.String());
            DropColumn("dbo.Mails", "SenderDomain");
        }
    }
}
