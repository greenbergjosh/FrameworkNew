namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_X_REF_ID : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Mails", "X_REF_ID", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Mails", "X_REF_ID");
        }
    }
}
