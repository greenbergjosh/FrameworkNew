namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_move_to_inbox_seed : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Seeds", "MoveMailToInbox", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Seeds", "MoveMailToInbox");
        }
    }
}
