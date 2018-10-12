namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class makeRequierdClient : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Clients", "Name", c => c.String(nullable: false));
            AlterColumn("dbo.Clients", "Description", c => c.String(nullable: false));
            AlterColumn("dbo.Clients", "CreatedAt", c => c.DateTime());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Clients", "CreatedAt", c => c.DateTime(nullable: false));
            AlterColumn("dbo.Clients", "Description", c => c.String());
            AlterColumn("dbo.Clients", "Name", c => c.String());
        }
    }
}
