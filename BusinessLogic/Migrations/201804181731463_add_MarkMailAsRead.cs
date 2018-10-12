namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_MarkMailAsRead : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Seeds", "MarkMailAsRead", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Seeds", "MarkMailAsRead");
        }
    }
}
