namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class updateClient : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Clients", "CreatedAt", c => c.DateTime(nullable: false, defaultValueSql: "GETUTCDATE()"));
            AddColumn("dbo.Clients", "UpdatedAt", c => c.DateTime(nullable: false, defaultValueSql: "GETUTCDATE()"));
            DropColumn("dbo.Clients", "Creataed_at");
            DropColumn("dbo.Clients", "Updated_at");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Clients", "Updated_at", c => c.DateTime(nullable: false));
            AddColumn("dbo.Clients", "Creataed_at", c => c.DateTime(nullable: false));
            DropColumn("dbo.Clients", "UpdatedAt");
            DropColumn("dbo.Clients", "CreatedAt");
        }
    }
}
