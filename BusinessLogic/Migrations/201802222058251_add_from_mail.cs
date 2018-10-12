namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_from_mail : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "From", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Mails", "From");
        }
    }
}
