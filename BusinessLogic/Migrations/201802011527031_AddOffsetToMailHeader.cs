namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddOffsetToMailHeader : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.MailHeaders", "Offset", c => c.Long(nullable: false));
            DropColumn("dbo.Headers", "Offset");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Headers", "Offset", c => c.Long(nullable: false));
            DropColumn("dbo.MailHeaders", "Offset");
        }
    }
}
