namespace BusinessLogic.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class HeaderSeq : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Headers", "Seq", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Headers", "Seq");
        }
    }
}
