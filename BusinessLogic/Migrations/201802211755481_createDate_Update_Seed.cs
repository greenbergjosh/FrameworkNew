namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class createDate_Update_Seed : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Seeds", "CreatedAt", c => c.DateTime(nullable: false));
            AddColumn("dbo.Seeds", "UpdatedAt", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Seeds", "UpdatedAt");
            DropColumn("dbo.Seeds", "CreatedAt");
        }
    }
}
