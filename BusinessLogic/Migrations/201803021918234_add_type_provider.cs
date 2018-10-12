namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_type_provider : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Providers", "Type", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Providers", "Type");
        }
    }
}
