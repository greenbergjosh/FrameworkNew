namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_smtp_data_provider : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Providers", "SMTPServer", c => c.String());
            AddColumn("dbo.Providers", "SMTPport", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Providers", "SMTPport");
            DropColumn("dbo.Providers", "SMTPServer");
        }
    }
}
