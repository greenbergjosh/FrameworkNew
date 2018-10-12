namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class delete_Mail_ISP : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.Mails", "ISP");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Mails", "ISP", c => c.String());
        }
    }
}
