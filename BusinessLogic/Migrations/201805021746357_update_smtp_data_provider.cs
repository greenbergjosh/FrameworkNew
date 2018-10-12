namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_smtp_data_provider : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Providers", "SMTPport", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Providers", "SMTPport", c => c.String());
        }
    }
}
