namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_seed_replay_mail : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Seeds", "ReplayMail", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Seeds", "ReplayMail");
        }
    }
}
