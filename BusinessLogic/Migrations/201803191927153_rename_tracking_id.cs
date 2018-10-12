namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class rename_tracking_id : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "TrackingId", c => c.String());
            DropColumn("dbo.Mails", "X_REF_ID");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Mails", "X_REF_ID", c => c.String());
            DropColumn("dbo.Mails", "TrackingId");
        }
    }
}
