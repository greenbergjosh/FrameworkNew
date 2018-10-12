namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addSeqHeader : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Headers", "seq", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Headers", "seq");
        }
    }
}
