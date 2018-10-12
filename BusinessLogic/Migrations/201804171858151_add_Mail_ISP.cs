namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_Mail_ISP : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "ISP", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Mails", "ISP");
        }
    }
}
